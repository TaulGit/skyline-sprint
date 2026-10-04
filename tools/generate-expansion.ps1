$ErrorActionPreference='Stop'
$env:HTTPS_PROXY='http://127.0.0.1:10808'
$env:HTTP_PROXY=$env:HTTPS_PROXY
$env:NODE_USE_ENV_PROXY='1'
$items=Get-Content assets/source/expansion-plan.json -Raw | ConvertFrom-Json
foreach($item in $items){
  npx tripo-cli@latest make $item.prompt --for toy --model tripo-p1 -p "face_limit=$($item.faces)" --seed $item.seed --name $item.name -o assets/source --dry-run --json
  if($LASTEXITCODE -ne 0){throw "Invalid plan: $($item.name)"}
}
foreach($item in $items){
  npx tripo-cli@latest make $item.prompt --for toy --model tripo-p1 -p "face_limit=$($item.faces)" --seed $item.seed --name $item.name -o assets/source --json --yes
  if($LASTEXITCODE -ne 0){throw "Generation failed: $($item.name)"}
}
