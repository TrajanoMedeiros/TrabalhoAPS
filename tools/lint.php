<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$phpPaths = ['public', 'src', 'tests', 'tools'];
$errors = 0;

foreach ($phpPaths as $path) {
    $directory = $root . DIRECTORY_SEPARATOR . $path;
    if (!is_dir($directory)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
    foreach ($iterator as $file) {
        if (!$file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }

        $command = sprintf('php -l %s', escapeshellarg($file->getPathname()));
        passthru($command, $exitCode);
        if ($exitCode !== 0) {
            $errors++;
        }
    }
}

$jsFile = $root . '/public/assets/app.js';
if (is_file($jsFile)) {
    passthru('node --check ' . escapeshellarg($jsFile), $exitCode);
    if ($exitCode !== 0) {
        $errors++;
    }
}

exit($errors === 0 ? 0 : 1);
