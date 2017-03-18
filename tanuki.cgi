#!/usr/bin/perl -wT
# たぬきことば

use strict;
use warnings;
use diagnostics;
use utf8;
use CGI;                  # CGIモジュールを使用する
use Encode qw/encode decode/;
use utf8;

my $cgi = new CGI();      # CGIモジュールをnewする
my $str = $cgi->param('text'); # パラメータtextの値を取得する

$str = decode('UTF-8', $str);

#$str = "あいたうえおた";
# 「た」を抜く
$str =~ s/た//g; 

$str = encode('UTF-8', $str);

my $body = $str;

print("Content-Type: text/plain; charset=UTF-8\r\n"); # Content-Typeヘッダを出力する
printf("Content-Length: %d\r\n", length($body));            # Content-Lengthヘッダを出力する
print("\r\n");                                              # ヘッダの終わりを示すCR+LFを出力する
print($body);                                               # ボディを出力する

exit(0);
