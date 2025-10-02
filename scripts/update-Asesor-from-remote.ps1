# Actualiza client\src\components\Asesor con los archivos de
# https://github.com/alexT1132/mqerk_ver1/tree/master/client/src/components/Asesores
# Modo: intenta svn export, si no usa git sparse-checkout en un clon temporal.

$ErrorActionPreference = 'Stop'
$repoRoot = 'C:\Users\MIGUEL CRUZ MQERK\Desktop\mqerk_ver1'
Set-Location -Path $repoRoot

$sourceRemoteUrl = 'https://github.com/alexT1132/mqerk_ver1'
$remotePath = 'client/src/components/Asesores'
$dest = Join-Path $repoRoot 'client\src\components\Asesor'

$timestamp = (Get-Date).ToString('yyyyMMddHHmmss')
if (Test-Path -Path $dest) {
    $backupDir = Join-Path $repoRoot ("backup_Asesor_$timestamp")
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Move-Item -Path $dest -Destination $backupDir -Force
    Write-Output "Backed up existing Asesor to: $backupDir"
} else {
    Write-Output 'No existing Asesor folder to backup.'
}

# Try svn
$hasSvn = $false
try {
    & svn --version | Out-Null
    $hasSvn = $true
} catch {
    $hasSvn = $false
}

if ($hasSvn) {
    Write-Output 'Using svn export method'
    $exportUrl = "$sourceRemoteUrl/trunk/$remotePath"
    svn export $exportUrl Asesores-temp --force
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item -Path 'Asesores-temp\*' -Destination $dest -Recurse -Force
    Remove-Item -Recurse -Force Asesores-temp
    Write-Output 'Exported via svn and copied to destination.'
} else {
    Write-Output 'svn not found, using git sparse-checkout method'
    $tmp = Join-Path $repoRoot 'temp-mqerk'
    if (Test-Path -Path $tmp) { Remove-Item -Recurse -Force $tmp }
    git clone --filter=blob:none --no-checkout "$sourceRemoteUrl.git" $tmp
    Push-Location $tmp
    try {
        git sparse-checkout init --cone
        git sparse-checkout set $remotePath
        # Detectar rama por defecto remota
        $headLine = git remote show origin 2>$null | Select-String 'HEAD branch:' | ForEach-Object { $_.ToString().Trim() }
        $defaultBranch = $null
        if ($headLine) {
            $parts = $headLine -split ':'
            if ($parts.Length -ge 2) { $defaultBranch = $parts[1].Trim() }
        }
        if (-not $defaultBranch) { $defaultBranch = 'main' }
        try {
            git checkout $defaultBranch
        } catch {
            Write-Output "Fallo checkout $defaultBranch, intentando 'master'"
            git checkout master
        }
    } finally {
        Pop-Location
    }
    # Construir la ruta fuente correctamente y añadir el comodín. Verificar existencia.
    $sourceFolder = Join-Path $tmp ($remotePath -replace '/','\\')
    if (-not (Test-Path -Path $sourceFolder)) {
        Write-Output "ERROR: source folder not found in clone: $sourceFolder"
        throw "Source folder missing"
    }
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    $sourcePattern = Join-Path $sourceFolder '*'
    Copy-Item -Path $sourcePattern -Destination $dest -Recurse -Force
    Remove-Item -Recurse -Force $tmp
    Write-Output 'Cloned via git sparse-checkout and copied to destination.'
}

Write-Output 'Done.'
