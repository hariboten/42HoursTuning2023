#!/bin/bash

#==================================
# リポジトリclone後に最初に実行してもらうスクリプト。
# 初期データのリストア・アプリ環境の構築を実施する。
# 一度だけ実行可能。
# VM側の実行だと引数は必要無いが、ローカル環境だと必須。
# usage ./init.sh [VMのドメイン] [秘密鍵のパス]
#==================================

if [[ -e ./.da/.initLock ]]; then
    echo "lockファイルがあるため処理を中断しました。"
    exit 1
fi

# リポジトリ初期化開始
echo "リポジトリの初期化を開始します。"

if [[ $HOSTNAME == env-* ]]; then
	webUrl="https://$HOSTNAME.ftt2306.dabaas.net/"
	cp -r /.da/* ./.da
elif [ $# -lt 2 ]; then
	echo "引数を2つ指定してください"
    exit 1
else
	webUrl="http://localhost/"
	vmDomain=$1
	privateKeyPath=$2
	scp -i $privateKeyPath azureuser@${vmDomain}:/.da/backup_mysql.zip ./.da
fi

(cd benchmarker && bash restore_and_migration.sh)

if [ $? -ne 0 ]; then	
	echo "初期化に失敗しました。"
	exit 1
else
	touch ./.da/.initLock
	echo -e "\n\n===================================================\n\n"
	echo -e "初期化に成功しました。以下を確認してみてください"
	echo -e "・web画面へアクセスできること(${webUrl})"
	echo -e "・初期スコアの計算（ルートディレクトリのrun.shを実行してみてください。）"
	echo -e "\n\n===================================================\n\n"
fi
