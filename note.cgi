#!/usr/bin/perl -wT
# メモに関するセッター、ゲッター
use strict;
use warnings;
use diagnostics;
use utf8;
use CGI;                  # CGIモジュールを使用する
use Encode qw/encode decode/;
use utf8;

my $cgi = new CGI();      # CGIモジュールをnewする
my $id = $cgi->param('id'); 
my $left = $cgi->param('left'); 
my $top = $cgi->param('top');
my $text = $cgi->param('text');
my $mode = $cgi->param('mode');
my $is_over = 0;
my $isFirstDelete = 0;

$text =~ s/\n//g;

my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
$year += 1900;
$mon += 1;
my $update = sprintf("%04d/%02d/%02d %02d:%02d",$year,$mon,$mday,$hour,$min,$sec);


#書き込みモード
if($mode eq "write"){
	#読み込み
	open(IN, "note.txt");
	my @note = <IN>;
	close(IN);

	#note.txtの初期化
	open(OUT, "> note.txt");
	print OUT "";
	close(OUT);

	my $line_num = 0;

	#一行ずつ調べながら書き込み
	open(OUT, ">> note.txt");
	foreach my $line (@note) {#1行ずつ取り出して調べる
		$line_num++;

		if($line =~ /$id/){#格納済みのIDであれば、更新
			if($line_num > 2){
			print OUT ",";	
			}
			print OUT "{\"id\":\"${id}\",\"left\":\"${left}\",\"top\":\"${top}\",\"text\":\"${text}\",\"update\":\"${update}\"}";
			print OUT "\n";
			$is_over = 1;
		}elsif($line =~ /]}/ && $is_over == 0){#終端行まで重複がなければ、終端に追加。
			if($line_num > 2){
			print OUT ",";	
			}
			print OUT "{\"id\":\"${id}\",\"left\":\"${left}\",\"top\":\"${top}\",\"text\":\"${text}\",\"update\":\"${update}\"}";
			print OUT "\n";
			print OUT ']}';
		}else{
			print OUT $line;
		}
	}
	close(OUT);
}

#クリアモード
if($mode eq "clear"){
	#note.txtの初期化
	open(OUT, "> note.txt");
	print OUT "{\"notes\":[\n]}";
	close(OUT);
}

if($mode eq "delete"){
	#読み込み
	open(IN, "note.txt");
	my @note = <IN>;
	close(IN);

	#note.txtの初期化
	open(OUT, "> note.txt");
	print OUT "";
	close(OUT);

	my $line_num = 0;

	#一行ずつ調べながら書き込み
	open(OUT, ">> note.txt");
	foreach my $line (@note) {#1行ずつ取り出して調べる
		$line_num++;

		if($line =~ /$id/){#格納済みのIDであれば、削除。
			if($line_num == 2){
				$isFirstDelete = 1;
			}
			print OUT "";
		}else{#そうでない場合、2行目で1行目が既に消されていた場合注意。
			if($line_num == 3 && $isFirstDelete == 1){
				$line =~ s/,//;
			}
			print OUT $line;
		}
	}
	close(OUT);
}


open(IN, "note.txt");
my @lines = <IN>;
close(IN);

my $body;
foreach my $line (@lines){
	$body = $body ."\n". $line;	
}

#my $body = "{\"id\":${id},\"left\":${left},\"top\":${top},\"text\":${text}}";#join('', @lines);

print("Content-Type: application/json; charset=UTF-8\r\n"); # Content-Typeヘッダを出力する
printf("Content-Length: %d\r\n", length($body));            # Content-Lengthヘッダを出力する
print("\r\n");                                              # ヘッダの終わりを示すCR+LFを出力する
print($body);                                               # ボディを出力する

exit(0);
