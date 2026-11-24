<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Guards also allow recovery from a partially applied MySQL DDL change.
        // Legacy messages stay null: only new submissions trigger notifications.
        if (!Schema::hasColumn('contact_messages', 'notification_recipient')) {
            Schema::table('contact_messages', fn (Blueprint $table) => $table->string('notification_recipient', 254)->nullable());
        }
        foreach (['notification_queued_at', 'notification_sent_at'] as $column) {
            if (!Schema::hasColumn('contact_messages', $column)) {
                Schema::table('contact_messages', fn (Blueprint $table) => $table->timestamp($column)->nullable());
            }
        }
        if (!Schema::hasIndex('contact_messages', 'contact_notification_pending_idx')) {
            Schema::table('contact_messages', fn (Blueprint $table) => $table->index(['notification_sent_at', 'notification_queued_at'], 'contact_notification_pending_idx'));
        }
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropIndex('contact_notification_pending_idx');
            $table->dropColumn(['notification_recipient', 'notification_queued_at', 'notification_sent_at']);
        });
    }
};
