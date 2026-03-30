<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'parent_id',
        'subject',
        'body',
        'read_at',
        'deleted_by_sender',
        'deleted_by_receiver',
    ];

    protected $casts = [
        'read_at'              => 'datetime',
        'deleted_by_sender'    => 'boolean',
        'deleted_by_receiver'  => 'boolean',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'parent_id');
    }

    public function scopeInbox($query, int $userId)
    {
        return $query->where('receiver_id', $userId)
                     ->where('deleted_by_receiver', false);
    }

    public function scopeSent($query, int $userId)
    {
        return $query->where('sender_id', $userId)
                     ->where('deleted_by_sender', false);
    }
}
