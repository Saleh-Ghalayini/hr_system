<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function upload(User $user, string $base64Image): string
    {
        if (!preg_match('/^data:(image\/(jpeg|png|webp|gif));base64,/i', $base64Image, $matches)) {
            abort(422, 'Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed.');
        }

        $mimeType  = strtolower($matches[1]);
        $raw       = str_replace(' ', '+', substr($base64Image, strpos($base64Image, ',') + 1));
        $imageData = base64_decode($raw, true);

        if ($imageData === false) {
            abort(422, 'Invalid base64 image data.');
        }

        if (strlen($imageData) > 2 * 1024 * 1024) {
            abort(422, 'Image exceeds the 2 MB size limit.');
        }

        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];
        $ext      = $extensions[$mimeType] ?? 'jpg';
        $fileName = 'profile_' . $user->id . '_' . time() . '.' . $ext;

        if ($user->profile_url && Storage::disk('public')->exists($user->profile_url)) {
            Storage::disk('public')->delete($user->profile_url);
        }

        Storage::disk('public')->put('profile_photos/' . $fileName, $imageData);

        $user->profile_url = 'profile_photos/' . $fileName;
        $user->save();

        return url('storage/profile_photos/' . $fileName);
    }
}
