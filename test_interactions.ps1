$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9233
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
    # Enable console
    Send-CDP "Runtime.enable" @{} | Out-Null

    # Click New Game
    Send-CDP "Runtime.evaluate" @{ expression = "document.getElementById('btn-new-game').click();" } | Out-Null
    Start-Sleep -Seconds 1

    # Test 1: Near resource (branch pile)
    $test1 = @"
    (function() {
        try {
            let p = window.game.player;
            // Spawn a resource right at player
            window.game.world.resources.push({
                id: 'test_res_1',
                type: 'branch_pile',
                x: p.x + 10,
                y: p.y,
                health: 50,
                maxHealth: 50,
                depleted: false,
                respawnTime: 60
            });
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test1; returnByValue = $true }
    Write-Output "Test 1 (Resource):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

    # Test 2: Near dropped item
    $test2 = @"
    (function() {
        try {
            let p = window.game.player;
            window.game.world.addDroppedItem('stone', 2, p.x + 10, p.y);
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test2; returnByValue = $true }
    Write-Output "Test 2 (Drop):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

    # Test 3: Near wild animal (rabbit)
    $test3 = @"
    (function() {
        try {
            let p = window.game.player;
            let a = new window.Animal('rabbit', p.x + 10, p.y);
            window.game.animalManager.animals.push(a);
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test3; returnByValue = $true }
    Write-Output "Test 3 (Wild animal):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

    # Test 4: Near DogCompanion
    $test4 = @"
    (function() {
        try {
            let p = window.game.player;
            let dog = new window.DogCompanion(p.x + 10, p.y, 0, 'Бобик');
            window.game.animalManager.dogs.push(dog);
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test4; returnByValue = $true }
    Write-Output "Test 4 (Dog Companion):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

    # Test 5: Near Building (Campfire)
    $test5 = @"
    (function() {
        try {
            let p = window.game.player;
            window.game.buildingSystem.place('campfire', p.x + 30, p.y);
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test5; returnByValue = $true }
    Write-Output "Test 5 (Campfire):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

    # Test 6: Near Building (Chest)
    $test6 = @"
    (function() {
        try {
            let p = window.game.player;
            window.game.buildingSystem.place('chest', p.x + 30, p.y);
            window.game.handleInteraction();
            return { success: true, err: null };
        } catch(e) {
            return { success: false, err: e.toString(), stack: e.stack };
        }
    })()
"@
    $res = Send-CDP "Runtime.evaluate" @{ expression = $test6; returnByValue = $true }
    Write-Output "Test 6 (Chest):"
    Write-Output ($res.result.result.value | ConvertTo-Json)

} finally {
    Stop-Process -Id $proc.Id -Force
}
