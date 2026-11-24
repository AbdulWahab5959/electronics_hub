<?php

namespace App\Console\Commands;

use App\Services\ProductDeduplicator;
use Illuminate\Console\Command;

class DeduplicateProducts extends Command
{
    protected $signature = 'products:deduplicate';
    protected $description = 'Back up and merge duplicate models while preserving carts, wishlists and order history';

    public function handle(ProductDeduplicator $deduplicator): int
    {
        $backup = storage_path('app/private/product-backups/'.now()->format('Ymd-His').'-'.bin2hex(random_bytes(4)).'.json');
        $result = $deduplicator->merge($backup);
        $this->info(json_encode($result, JSON_THROW_ON_ERROR));
        if ($result['removed']) $this->info('Backup: '.$backup);
        return self::SUCCESS;
    }
}
