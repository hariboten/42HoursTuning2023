#!/bin/bash
#==================================
# VM環境をテンプレートから生成するスクリプト。
# azコマンドが対象のサブスクリプションで利用できる必要がある。
# DNSのAレコードは後から手動で設定する必要がある（publicIPアドレスとの紐付け）。
# usage ./createVM [subscriptionId] [resourceGroupName] [resourceName] [adminUserName] [adminPublicKey]
#==================================

if [ $# -lt 5 ]; then
    echo "引数を5つ指定してください。"
    exit 1
fi

subscriptionId=$1
resourceGroupName=$2
resourceName=$3
adminUserName=$4
adminPublicKey=$5

token=`az account get-access-token --subscription ${subscriptionId} --query 'accessToken' -o tsv`
armTemplate=`cat arm-template.json`

# sedコマンドの空白をエスケープするために{space}に置換
escapePublicKey=`echo $adminPublicKey | sed -e 's"\ "{space}"g'`
parameters=`cat parameters.json | sed -e 's"__resourceName__"'${resourceName}'"' -e 's"__adminUserName__"'${adminUserName}'"' -e 's"__adminPublicKey__"'${escapePublicKey}'"' -e 's"{space}"\ "g'`

reuestBody=`echo '{"properties": {"mode": "Incremental", "template": '$armTemplate', "parameters": '$parameters'}}' | jq .`

curl -X PUT -H 'content-type: application/json' -H "Authorization: Bearer ${token}" --data-raw "$reuestBody" \
"https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${resourceGroupName}/providers/Microsoft.Resources/deployments/env-provisioning?api-version=2019-05-01"
