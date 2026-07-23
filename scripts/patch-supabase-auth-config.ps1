Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class Cred {
  [DllImport("advapi32", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credential);
  [DllImport("advapi32")] public static extern void CredFree(IntPtr cred);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public int Flags; public int Type; public IntPtr TargetName; public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public int CredentialBlobSize; public IntPtr CredentialBlob; public int Persist;
    public int AttributeCount; public IntPtr Attributes; public IntPtr TargetAlias;
    public IntPtr UserName;
  }
}
"@

$targets = @("Supabase CLI:access-token", "Supabase CLI:supabase")
$token = $null

foreach ($target in $targets) {
  $ptr = [IntPtr]::Zero
  if (-not [Cred]::CredRead($target, 1, 0, [ref]$ptr)) { continue }
  $cred = [Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [type][Cred+CREDENTIAL])
  $bytes = New-Object byte[] $cred.CredentialBlobSize
  [Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $bytes, 0, $cred.CredentialBlobSize)
  $unicode = [Text.Encoding]::Unicode.GetString($bytes).Trim([char]0)
  $utf8 = [Text.Encoding]::UTF8.GetString($bytes).Trim([char]0)
  [Cred]::CredFree($ptr)
  foreach ($candidate in @($unicode, $utf8)) {
    if ($candidate -match '^sbp_[A-Za-z0-9]+$') {
      $token = $candidate
      break
    }
  }
  if ($token) { break }
}

if (-not $token) {
  throw "Could not read a valid Supabase personal access token (sbp_...)"
}

$body = @{
  site_url       = "https://www.plantik.io"
  uri_allow_list = "https://www.plantik.io/auth/callback,https://plantik.io/auth/callback,http://localhost:3000/auth/callback,https://d34c5kntfvc2d2.amplifyapp.com/auth/callback"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Method PATCH `
  -Uri "https://api.supabase.com/v1/projects/zozbmfqeblxjvmqxvbkv/config/auth" `
  -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $body

$response | ConvertTo-Json -Depth 5
