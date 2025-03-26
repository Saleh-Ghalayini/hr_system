<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\PerformanceType;

class TeamPerformance extends Model
{
    protected $table = 'teams_performance';
    protected $fillable = [
        'user_id',
        'type_id',
        'rate',
        'comment',
    ]; 
    public function user(): BelongsTo {
        return $this->belongsTo(User::class,'user_id');
    }
   public function rateType(){
    return $this->belongsTo(PerformanceType::class,'type_id');
   }

}
