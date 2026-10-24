$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9234
$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--remote-debugging-port=$port", "--disable-gpu", "file:///c:/Users/userk/Documents/GitHub/island/index.html" -PassThru

Start-Sleep -Seconds 3

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:$port/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*index.html*" }
    $wsUrl = $pageTab.webSocketDebuggerUrl

    $ws = [System.Net.WebSockets.ClientWebSocket]::new()
    $cts = [System.Threading.CancellationTokenSource]::new(10000)
    $ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

    function Send-CDP($method, $params) {
        $id = [System.Threading.Interlocked]::Increment([ref]$script:msgId)
        $msg = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $segment = [System.ArraySegment[byte]]::new($bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

        $buf = [byte[]]::new(65536)
        while ($true) {
            $resSegment = [System.ArraySegment[byte]]::new($buf)
            $recv = $ws.ReceiveAsync($resSegment, [System.Threading.CancellationToken]::None).Result
            $resStr = [System.Text.Encoding]::UTF8.GetString($buf, 0, $recv.Count)
            $obj = $resStr | ConvertFrom-Json
            if ($obj.id -eq $id) {
                return $obj
            }
        }
    }

    $script:msgId = 0

    # Start game
    Send-CDP "Runtime.evaluate" @{ expression = "document.getElementById('btn-new-game').click();" } | Out-Null
    Start-Sleep -Seconds 1

    $testAllScript = @"
    (function() {
        let results = [];
        let p = window.game.player;

        // 1. Test all resources
        let resourceTypes = ['tree', 'palm', 'coconut_palm', 'rock_node', 'bush', 'berry_bush', 'mushroom_spot', 'branch_pile', 'fiber_plant'];
        for (let rType of resourceTypes) {
            try {
                window.game.world.resources = [{
                    id: 'test_' + rType,
                    type: rType,
                    x: p.x + 10,
                    y: p.y,
                    health: 100,
                    maxHealth: 100,
                    depleted: false,
                    respawnTime: 60
                }];
                window.game.world.droppedItems = [];
                window.game.buildingSystem.buildings = [];
                window.game.animalManager.animals = [];
                window.game.animalManager.dogs = [];

                window.game.handleInteraction();
                // deplete it
                window.game.handleInteraction();
                results.push({ target: 'resource:' + rType, status: 'ok' });
            } catch(e) {
                results.push({ target: 'resource:' + rType, status: 'error', error: e.toString(), stack: e.stack });
            }
        }

        // 2. Test all animals
        let animalSpecies = ['rabbit', 'turtle', 'parrot', 'boar', 'wild_dog'];
        for (let sp of animalSpecies) {
            try {
                window.game.world.resources = [];
                window.game.world.droppedItems = [];
                window.game.buildingSystem.buildings = [];
                window.game.animalManager.animals = [new window.Animal(sp, p.x + 10, p.y)];
                window.game.animalManager.dogs = [];

                window.game.handleInteraction();
                results.push({ target: 'animal:' + sp, status: 'ok' });
            } catch(e) {
                results.push({ target: 'animal:' + sp, status: 'error', error: e.toString(), stack: e.stack });
            }
        }

        // 3. Test dog companion
        try {
            window.game.world.resources = [];
            window.game.world.droppedItems = [];
            window.game.buildingSystem.buildings = [];
            window.game.animalManager.animals = [];
            window.game.animalManager.dogs = [new window.DogCompanion(p.x + 10, p.y, 0, 'Рекс')];

            window.game.handleInteraction();
            results.push({ target: 'dog_companion', status: 'ok' });
        } catch(e) {
            results.push({ target: 'dog_companion', status: 'error', error: e.toString(), stack: e.stack });
        }

        // 4. Test all buildings
        let buildingTypes = ['campfire', 'shelter', 'wooden_house', 'chest', 'workbench', 'rain_collector', 'garden', 'dog_house', 'feeder', 'waterer'];
        for (let bType of buildingTypes) {
            try {
                window.game.world.resources = [];
                window.game.world.droppedItems = [];
                window.game.animalManager.animals = [];
                window.game.animalManager.dogs = [];
                window.game.buildingSystem.buildings = [{
                    id: 'b_' + bType,
                    type: bType,
                    x: p.x + 20,
                    y: p.y,
                    health: 100,
                    waterLevel: 5,
                    inventory: null
                }];

                window.game.handleInteraction();
                results.push({ target: 'building:' + bType, status: 'ok' });
            } catch(e) {
                results.push({ target: 'building:' + bType, status: 'error', error: e.toString(), stack: e.stack });
            }
        }

        // 5. Test dropped items
        let dropItems = ['branch', 'wood', 'stone', 'fiber', 'berry', 'coconut', 'water'];
        for (let dItem of dropItems) {
            try {
                window.game.world.resources = [];
                window.game.animalManager.animals = [];
                window.game.animalManager.dogs = [];
                window.game.buildingSystem.buildings = [];
                window.game.world.droppedItems = [{
                    id: 'drop_' + dItem,
                    itemId: dItem,
                    count: 1,
                    x: p.x + 10,
                    y: p.y
                }];

                window.game.handleInteraction();
                results.push({ target: 'drop:' + dItem, status: 'ok' });
            } catch(e) {
                results.push({ target: 'drop:' + dItem, status: 'error', error: e.toString(), stack: e.stack });
            }
        }

        return results;
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $testAllScript; returnByValue = $true }
    Write-Output "Results:"
    Write-Output ($res.result.result.value | ConvertTo-Json -Depth 5)

} finally {
    Stop-Process -Id $proc.Id -Force
}
