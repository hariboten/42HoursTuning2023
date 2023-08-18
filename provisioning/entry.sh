#!/bin/bash

#==================================
# VM環境のみforkしたリポジトリをcloneし、初期化するスクリプト。
# 一度だけ実行可能。
#==================================


repoName="42HoursTuning2023"

if [[ $HOSTNAME != team-* ]]; then
  echo "ローカル環境ではこのスクリプトは利用できません。"
  exit 1
fi

if [[ -e /.da/cloneUrl ]]; then
  echo "既にリポジトリをcloneしているため、処理を中断しました。"
  exit 1
fi

echo -n "forkしたリポジトリのURLを入力ください: "
read repoUrl

git clone $repoUrl && (cd ./${repoName} && bash init.sh ) && echo -n $repoUrl > /.da/cloneUrl

if [ $? -ne 0 ]; then
	echo "リポジトリURLが誤っていないかご確認ください。"
	exit 1
fi
