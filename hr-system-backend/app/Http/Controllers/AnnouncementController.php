<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    use ApiResponse;

    /** GET /announcements — visible to all authenticated users */
    public function index(Request $request)
    {
        $query = Announcement::active()
            ->with('author:id,first_name,last_name')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        // Filter by target role
        $user = Auth::user();
        $query->where(function ($q) use ($user) {
            $q->whereNull('target_role')
              ->orWhere('target_role', $user->role)
              ->orWhere('target_role', 'all');
        });

        return $this->success($query->paginate(15));
    }

    /** GET /admin/announcements — admin list with full control */
    public function adminIndex(Request $request)
    {
        $query = Announcement::withTrashed()
            ->with('author:id,first_name,last_name')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return $this->success($query->paginate(20));
    }

    /** POST /admin/announcements */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'body'         => 'required|string|max:5000',
            'type'         => 'required|in:info,warning,urgent',
            'is_pinned'    => 'boolean',
            'target_role'  => 'nullable|in:all,employee,manager,admin',
            'published_at' => 'nullable|date',
            'expires_at'   => 'nullable|date',
        ]);

        // Validate expires_at is after published_at only when both are provided
        if (!empty($data['expires_at']) && !empty($data['published_at'])) {
            if (strtotime($data['expires_at']) <= strtotime($data['published_at'])) {
                return $this->validationError(['expires_at' => ['Expiration date must be after the publish date.']]);
            }
        }

        $announcement = Announcement::create([
            ...$data,
            'author_id'    => Auth::id(),
            'published_at' => $data['published_at'] ?? now(),
        ]);

        $announcement->load('author:id,first_name,last_name');

        return $this->created($announcement, 'Announcement created successfully.');
    }

    /** PUT /admin/announcements/{announcement} */
    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'body'         => 'sometimes|string|max:5000',
            'type'         => 'sometimes|in:info,warning,urgent',
            'is_pinned'    => 'sometimes|boolean',
            'target_role'  => 'nullable|in:all,employee,manager,admin',
            'published_at' => 'nullable|date',
            'expires_at'   => 'nullable|date',
        ]);

        // Validate expires_at is after published_at only when both are provided
        if (!empty($data['expires_at']) && !empty($data['published_at'])) {
            if (strtotime($data['expires_at']) <= strtotime($data['published_at'])) {
                return $this->validationError(['expires_at' => ['Expiration date must be after the publish date.']]);
            }
        }

        $announcement->update($data);

        return $this->success($announcement->fresh('author'), 'Announcement updated successfully.');
    }

    /** DELETE /admin/announcements/{announcement} */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return $this->success(null, 'Announcement deleted successfully.');
    }
}
