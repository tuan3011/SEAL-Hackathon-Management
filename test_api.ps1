$body1 = @{ username="ptest1"; password="password123" } | ConvertTo-Json
$res1 = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body $body1
$token1 = $res1.data.accessToken

$body2 = @{ username="ptest2"; password="password123" } | ConvertTo-Json
$res2 = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body $body2
$token2 = $res2.data.accessToken

$body3 = @{ username="mentor1"; password="password123" } | ConvertTo-Json
$res3 = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body $body3
$tokenMentor = $res3.data.accessToken

function Test-Api {
    param (
        [string]$Method,
        [string]$Url,
        [string]$Body,
        [string]$Token
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "http://localhost:8080$Url"
        Headers = $headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = "application/json"
    }

    Write-Host "---"
    Write-Host "Request: $Method $Url"
    if ($Body) {
        Write-Host "Body: $Body"
    }
    
    try {
        $response = Invoke-WebRequest @params
        Write-Host "Status: $($response.StatusCode)"
        $content = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
        Write-Host "Response:`n$content"
        return $response
    } catch {
        $ex = $_.Exception
        if ($ex.Response) {
            Write-Host "Status: $($ex.Response.StatusCode.value__)"
            try {
                $stream = $ex.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $content = $reader.ReadToEnd() | ConvertFrom-Json | ConvertTo-Json -Depth 5
                Write-Host "Response:`n$content"
            } catch {
                Write-Host "Response: could not parse stream"
            }
            return $ex.Response
        } else {
            Write-Host "Response: $($_.Exception.Message)"
            return $null
        }
    }
}

# 3. Test Team
# Create Team
# $createTeamBody = @{
#     name = "New Awesome Team"
#     projectName = "Awesome Project"
#     projectDescription = "It does awesome things"
#     eventId = 1
#     trackId = 1
# } | ConvertTo-Json
# $resCreate = Test-Api -Method POST -Url "/api/v1/teams" -Body $createTeamBody -Token $token1

$teamId = 5

# Get Team Detail
Test-Api -Method GET -Url "/api/v1/teams/$teamId" -Token $token1

# Get Team List (maybe /api/v1/teams/event/1 or something)
Test-Api -Method GET -Url "/api/v1/teams/event/1" -Token $token1

# Update Team
$updateTeamBody = @{
    name = "Updated Awesome Team"
    projectName = "Updated Project"
    projectDescription = "Updated desc"
} | ConvertTo-Json
Test-Api -Method PUT -Url "/api/v1/teams/$teamId" -Body $updateTeamBody -Token $token1

# 4. Test Team Invitation
# Create Invitation
$inviteBody = @{
    teamId = 5
    inviteeEmail = "ptest2@test.com"
} | ConvertTo-Json
$resInvite = Test-Api -Method POST -Url "/api/v1/team-invitations" -Body $inviteBody -Token $token1

$invitationId = ""
if ($resInvite -and $resInvite.StatusCode -eq 200 -or $resInvite.StatusCode -eq 201) {
    $data = $resInvite.Content | ConvertFrom-Json
    $invitationId = $data.data.id
}

# Get Invitations (student2)
Test-Api -Method GET -Url "/api/v1/team-invitations/pending" -Token $token2

# Accept Invitation (student2)
if ($invitationId) {
    $acceptBody = @{ status = "ACCEPTED" } | ConvertTo-Json
    Test-Api -Method PUT -Url "/api/v1/team-invitations/$invitationId/respond" -Body $acceptBody -Token $token2
}

# 5. Test Mentorship Request
# Create Mentorship Request
$mentorReqBody = @{
    teamId = $teamId
    title = "Help with something"
    description = "We are stuck"
} | ConvertTo-Json
$resMentor = Test-Api -Method POST -Url "/api/v1/mentorship-requests" -Body $mentorReqBody -Token $token1

$mentorReqId = ""
if ($resMentor -and $resMentor.StatusCode -eq 201) {
    $data = $resMentor.Content | ConvertFrom-Json
    $mentorReqId = $data.data.id
}

# Get Request Detail
if ($mentorReqId) {
    Test-Api -Method GET -Url "/api/v1/mentorship-requests/$mentorReqId" -Token $token1

    # Accept Request (Mentor)
    Test-Api -Method PUT -Url "/api/v1/mentorship-requests/$mentorReqId/accept" -Token $tokenMentor

    # Resolve Request (Mentor)
    Test-Api -Method PUT -Url "/api/v1/mentorship-requests/$mentorReqId/resolve" -Token $tokenMentor
}
