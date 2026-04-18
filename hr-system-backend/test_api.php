<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test with Hassan (user ID 3) who has seeded data
$response = app()->handle(\Illuminate\Http\Request::create('/api/v1/guest/login', 'POST', ['email' => 'hassan@email.com', 'password' => 'SecurePass123']));
$data = json_decode($response->getContent(), true);

if (isset($data['data']['token'])) {
    $token = $data['data']['token'];
    echo "Token for Hassan (user 3)\n";
    
    // Test performance report
    $request = \Illuminate\Http\Request::create('/api/v1/performance/report', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $response = app()->handle($request);
    $data = json_decode($response->getContent(), true);
    echo "\nReport success: " . ($data['success'] ?? false) . "\n";
    echo "Scores: " . json_encode($data['data']['scores'] ?? []) . "\n";
    
    // Test with Admin
    $response = app()->handle(\Illuminate\Http\Request::create('/api/v1/guest/login', 'POST', ['email' => 'admin@hr.com', 'password' => 'SecurePass123']));
    $data = json_decode($response->getContent(), true);
    $token = $data['data']['token'];
    
    // Test average
    $request = \Illuminate\Http\Request::create('/api/v1/performance/average', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $response = app()->handle($request);
    $data = json_decode($response->getContent(), true);
    echo "\nAverage success: " . ($data['success'] ?? false) . "\n";
    echo "Average count: " . count($data['data'] ?? []) . "\n";
    echo json_encode($data['data'] ?? [], JSON_PRETTY_PRINT) . "\n";
    
    // Test department overview
    $request = \Illuminate\Http\Request::create('/api/v1/admin/performance/department-overview', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $response = app()->handle($request);
    $data = json_decode($response->getContent(), true);
    echo "\nDept Overview success: " . ($data['success'] ?? false) . "\n";
    echo "Dept count: " . count($data['data'] ?? []) . "\n";
    echo json_encode($data['data'] ?? [], JSON_PRETTY_PRINT) . "\n";
    
    // Test peers
    $request = \Illuminate\Http\Request::create('/api/v1/performance/peers', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $response = app()->handle($request);
    $data = json_decode($response->getContent(), true);
    echo "\nPeers success: " . ($data['success'] ?? false) . "\n";
    echo "Peers count: " . count($data['data'] ?? []) . "\n";
    echo json_encode($data['data'] ?? [], JSON_PRETTY_PRINT) . "\n";
}
