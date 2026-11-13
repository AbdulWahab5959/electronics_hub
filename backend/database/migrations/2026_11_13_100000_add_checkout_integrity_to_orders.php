<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('idempotency_key')->nullable();
            $table->char('request_hash', 64)->nullable();
            $table->uuid('quote_id')->nullable()->unique();
            $table->char('currency', 3)->default('PKR');
            $table->string('payment_status')->default('awaiting_collection');
            $table->unique(['user_id', 'idempotency_key']);
        });
        Schema::table('carts', fn (Blueprint $table) => $table->unique(['user_id', 'product_id']));
    }

    public function down(): void
    {
        Schema::table('carts', fn (Blueprint $table) => $table->dropUnique(['user_id', 'product_id']));
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'idempotency_key']);
            $table->dropUnique(['quote_id']);
            $table->dropColumn(['idempotency_key', 'request_hash', 'quote_id', 'currency', 'payment_status']);
        });
    }
};
