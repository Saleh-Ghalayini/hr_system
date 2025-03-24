<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $fillable = [
        'user_id',
        'sender',
        'recipient',
        'subject',
        'body'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
