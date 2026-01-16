# Fix remaining imports script
# Run this if dev server shows import errors

Write-Host "Fixing imports to use @core paths..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse -File

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $modified = $false
        
        # Check if file has old imports
        if ($content -match "from\s+['""]@/(services|components/ui|components/common|hooks|contexts|config|layouts|middlewares|lib)/") {
            
            # Replace all old paths with @core paths
            $newContent = $content `
                -replace "from\s+(['""])@/services/", "from `$1@core/services/" `
                -replace "from\s+(['""])@/components/ui/", "from `$1@core/components/ui/" `
                -replace "from\s+(['""])@/components/common/", "from `$1@core/components/common/" `
                -replace "from\s+(['""])@/layouts/", "from `$1@core/layouts/" `
                -replace "from\s+(['""])@/hooks/", "from `$1@core/hooks/" `
                -replace "from\s+(['""])@/contexts/", "from `$1@core/contexts/" `
                -replace "from\s+(['""])@/config/", "from `$1@core/config/" `
                -replace "from\s+(['""])@/middlewares/", "from `$1@core/middlewares/" `
                -replace "from\s+(['""])@/lib/", "from `$1@core/lib/"
            
            if ($newContent -ne $content) {
                Set-Content -Path $file.FullName -Value $newContent -NoNewline -ErrorAction Stop
                Write-Host "✓ Fixed: $($file.Name)" -ForegroundColor Green
                $modified = $true
            }
        }
    }
    catch {
        Write-Host "✗ Skipped (locked): $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "`nDone! Restart dev server if needed." -ForegroundColor Cyan
