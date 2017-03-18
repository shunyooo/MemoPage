#!/usr/bin/perl -wT
# アクセスカウンタ

use strict;
use warnings;
use diagnostics;
use utf8;
use CGI;                  # CGIモジュールを使用する

my $count = 1;

# カウントファイルから読み込み
open(IN, "counter.txt");
$count = <IN>;
close(IN);

# カウント増加
$count++;

# カウントファイルに書き込み
open(OUT, "> counter.txt");
print OUT $count;
close(OUT);

# JSONを生成する
my $body =<<"EOD";
{
    "count": $count
}
EOD

print("Content-Type: application/json; charset=UTF-8\r\n"); # Content-Typeヘッダを出力する
printf("Content-Length: %d\r\n", length($body));            # Content-Lengthヘッダを出力する
print("\r\n");                                              # ヘッダの終わりを示すCR+LFを出力する
print($body);                                               # ボディを出力する

exit(0);
