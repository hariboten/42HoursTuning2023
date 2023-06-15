#!/bin/bash

# ==================================
# 初期データ用csv作成スクリプト。
# ==================================

mkdir -p ../mysql_init/csv
echo "office_id,office_name" > ../mysql_init/csv/office_init.csv
echo "file_id,file_name,path" > ../mysql_init/csv/file_init.csv
echo "user_id,employee_id,user_name,kana,mail,password,entry_date,office_id,user_icon_id,goal" > ../mysql_init/csv/user_init.csv
echo "session_id,user_id,created_at" > ../mysql_init/csv/session_init.csv
echo "department_id,department_name,active" > ../mysql_init/csv/department_init.csv
echo "role_id,role_name,active" > ../mysql_init/csv/role_init.csv
echo "department_id,role_id,user_id,entry_date,belong" > ../mysql_init/csv/department_role_member_init.csv
echo "skill_id,skill_name" > ../mysql_init/csv/skill_init.csv
echo "skill_id,user_id" > ../mysql_init/csv/skill_member_init.csv
echo "match_group_id,match_group_name,description,status,created_by,created_at" > ../mysql_init/csv/match_group_init.csv
echo "match_group_id,user_id" > ../mysql_init/csv/match_group_member_init.csv

DOCKER_BUILDKIT=1 docker build -t csv . && \
docker run --rm \
-v $(pwd)/../mysql_init/csv:/csv \
csv node /create_init_data/dist/createDummyDataCSV.js
