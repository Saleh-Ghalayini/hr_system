<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    use ApiResponse;

    /** GET /messages/inbox */
    public function inbox(Request $request)
    {
        $query = Message::inbox(Auth::id())
            ->with('sender:id,first_name,last_name,profile_url')
            ->whereNull('parent_id')   // top-level messages only in inbox
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%$search%")
                  ->orWhere('body', 'like', "%$search%")
                  ->orWhereHas('sender', fn($u) => $u->where('first_name', 'like', "%$search%")
                                                      ->orWhere('last_name', 'like', "%$search%"));
            });
        }

        return $this->success($query->paginate(20));
    }

    /** GET /messages/sent */
    public function sent(Request $request)
    {
        $query = Message::sent(Auth::id())
            ->with('receiver:id,first_name,last_name,profile_url')
            ->whereNull('parent_id')
            ->orderByDesc('created_at');

        return $this->success($query->paginate(20));
    }

    /** POST /messages */
    public function store(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|exists:users,id|different:' . Auth::id(),
            'subject'     => 'nullable|string|max:255',
            'body'        => 'required|string|max:5000',
            'parent_id'   => 'nullable|exists:messages,id',
        ]);

        $message = Message::create([
            'sender_id'   => Auth::id(),
            'receiver_id' => $data['receiver_id'],
            'subject'     => $data['subject'] ?? null,
            'body'        => $data['body'],
            'parent_id'   => $data['parent_id'] ?? null,
        ]);

        $message->load('sender:id,first_name,last_name', 'receiver:id,first_name,last_name');

        return $this->created($message, 'Message sent successfully.');
    }

    /** GET /messages/{message} */
    public function show(Message $message)
    {
        $userId = Auth::id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            return $this->forbidden('Access denied.');
        }

        // Mark as read if receiver is viewing
        if ($message->receiver_id === $userId && !$message->read_at) {
            $message->update(['read_at' => now()]);
        }

        $message->load([
            'sender:id,first_name,last_name,profile_url',
            'receiver:id,first_name,last_name,profile_url',
            'replies.sender:id,first_name,last_name,profile_url',
        ]);

        return $this->success($message);
    }

    /** PUT /messages/{message}/read */
    public function markRead(Message $message)
    {
        if ($message->receiver_id !== Auth::id()) {
            return $this->forbidden('Access denied.');
        }

        $message->update(['read_at' => now()]);

        return $this->success(null, 'Message marked as read.');
    }

    /** DELETE /messages/{message} */
    public function destroy(Message $message)
    {
        $userId = Auth::id();

        if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
            return $this->forbidden('Access denied.');
        }

        if ($message->sender_id === $userId) {
            $message->update(['deleted_by_sender' => true]);
        } else {
            $message->update(['deleted_by_receiver' => true]);
        }

        // Hard delete if both sides deleted
        if ($message->fresh()->deleted_by_sender && $message->fresh()->deleted_by_receiver) {
            $message->delete();
        }

        return $this->success(null, 'Message deleted.');
    }

    /** GET /messages/unread-count */
    public function unreadCount()
    {
        $count = Message::inbox(Auth::id())
            ->whereNull('read_at')
            ->count();

        return $this->success(['count' => $count]);
    }

    /** GET /messages/users — list all users to compose a message to */
    public function users()
    {
        $users = User::where('id', '!=', Auth::id())
            ->select('id', 'first_name', 'last_name', 'position', 'profile_url')
            ->orderBy('first_name')
            ->get();

        return $this->success($users);
    }
}
