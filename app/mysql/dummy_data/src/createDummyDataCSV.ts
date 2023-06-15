import * as fs from "fs";
import * as crypto from "crypto";
import { stringify } from "csv-stringify/sync";
import { v4 as uuidv4 } from "uuid";
import {
  Office,
  officeNames,
  File,
  fileNames,
  User,
  createName,
  getRandomInt,
  Department,
  departmentNames,
  Role,
  roleNames,
  DepartmentRoleMember,
  getWeightedRoleIndex,
  Skill,
  skillNames,
  SkillMember,
  MatchGroup,
  MatchGroupMember,
  getRoleIndex,
  goals,
} from "./helper";

let departments: Department[] = [];

const createDepartments = () => {
  const departmentNum = 60;

  for (let i = 0; i < departmentNum; i++) {
    departments.push({
      department_id: uuidv4(),
      department_name: `${departmentNames[i % departmentNames.length]}${
        ((i / departmentNames.length) | 0) + 1
      }`,
      active: i >= departmentNum / 2, // 0 <= i <= 29 はactive = false
    });
  }
  fs.appendFileSync("/csv/department_init.csv", stringify(departments));
};

let roles: Role[] = [];

const createRoles = () => {
  roles = roleNames.map((roleName) => {
    return {
      role_id: uuidv4(),
      role_name: roleName,
      active: true,
    };
  });

  fs.appendFileSync("/csv/role_init.csv", stringify(roles));
};

let offices: Office[] = [];

const createOffices = () => {
  offices = officeNames.map((officeName) => {
    return {
      office_id: uuidv4(),
      office_name: officeName,
    };
  });

  fs.appendFileSync("/csv/office_init.csv", stringify(offices));
};

let files: File[] = [];

const createFiles = () => {
  files = fileNames.map((fileName, index) => {
    return {
      file_id: index === 0 ? "test-file-id" : uuidv4(),
      file_name: fileName,
      path: `images/user-icon/${fileName}`,
    };
  });

  fs.appendFileSync("/csv/file_init.csv", stringify(files));
};

let skills: Skill[] = [];

const createSkills = () => {
  skills = skillNames.map((skillName) => {
    return {
      skill_id: uuidv4(),
      skill_name: skillName,
    };
  });

  fs.appendFileSync("/csv/skill_init.csv", stringify(skills));
};

let users: User[] = [];

const createUsers = () => {
  const userNum = 300000;
  for (let i = 0; i < userNum; i++) {
    const userName = createName();

    const hash = crypto.createHash("sha256");
    hash.update(`pass${i + 1}`);
    const hashPassword = hash.digest("hex");

    const entryYear = getRandomInt(1980, 2023);

    users.push({
      user_id: i === 0 ? "test-user-id" : uuidv4(),
      employee_id: `popy${i + 1}`,
      user_name: userName.userName,
      kana: userName.kana,
      mail: `popy${i + 1}@example.com`,
      password: hashPassword,
      entry_date: `${entryYear}-04-01`,
      office_id: offices[Math.floor(Math.random() * offices.length)].office_id,
      user_icon_id:
        i === 0
          ? "test-file-id"
          : files[Math.floor(Math.random() * files.length)].file_id,
      goal: goals[i % goals.length],
    });
  }

  fs.appendFileSync("/csv/user_init.csv", stringify(users));
};

const createSkillMembers = () => {
  let skillMembers: SkillMember[] = [];

  for (const user of users) {
    const skillNum = 3;
    const skillIdIndex = getRandomInt(0, skillNames.length - 3);
    for (let i = 0; i < skillNum; i++) {
      skillMembers.push({
        // skillsのindex番目から連続してskillNum個分のスキルを登録
        skill_id: skills[skillIdIndex + i].skill_id,
        user_id: user.user_id,
      });
    }
  }

  fs.appendFileSync("/csv/skill_member_init.csv", stringify(skillMembers));
};

const createDepartmentRoleMembers = () => {
  let departmentRoleMembers: DepartmentRoleMember[] = [];

  users.forEach((user, index) => {
    // 2年に一度異動
    const transferNum = ((2023 - Number(user.entry_date.slice(0, 4))) / 2) | 0;
    const assignNum = transferNum + 1;
    for (let i = 0; i < assignNum; i++) {
      const departmentIndex =
        i === transferNum
          ? departments.length / 2 + (index % (departments.length / 2)) // 最新の所属部署はactive = true
          : getRandomInt(0, departments.length - 1);
      departmentRoleMembers.push({
        department_id: departments[departmentIndex].department_id,
        role_id:
          i === transferNum
            ? roles[getRoleIndex(index)].role_id
            : roles[getWeightedRoleIndex()].role_id,
        user_id: user.user_id,
        entry_date:
          (Number(user.entry_date.slice(0, 4)) + 2 * i).toString() + "-04-01",
        belong: i === transferNum, // 最新の所属部署はbelong = true
      });
      // 100万件ごとにcsvに書き出す
      if (departmentRoleMembers.length >= 1000000) {
        fs.appendFileSync(
          "/csv/department_role_member_init.csv",
          stringify(departmentRoleMembers)
        );
        departmentRoleMembers = [];
      }
    }
  });

  fs.appendFileSync(
    "/csv/department_role_member_init.csv",
    stringify(departmentRoleMembers)
  );
};

const createMatchGroups = () => {
  let matchGroups: MatchGroup[] = [];
  let matchGroupMembers: MatchGroupMember[] = [];

  // 1ユーザーあたりが作成するマッチグループ数
  const matchGroupNumCreatedByEachUser = 4;
  for (const user of users) {
    // 作成日は入社日以降かつ2020年以降
    const minCreatedYear = Math.max(2020, Number(user.entry_date.slice(0, 4)));
    const createdYear = getRandomInt(minCreatedYear, 2023);
    for (let i = 0; i < matchGroupNumCreatedByEachUser; i++) {
      const matchGroupId = uuidv4();
      matchGroups.push({
        match_group_id: matchGroupId,
        match_group_name: `${user.user_name}作成マッチグループ${i + 1}`,
        description: `${user.user_name}作成雑談用マッチグループ`,
        status: i === 1 ? "open" : "close",
        created_by: user.user_id,
        created_at:
          createdYear === 2023
            ? `2023-${getRandomInt(4, 5)}-${getRandomInt(2, 30)}`
            : `${createdYear}-${getRandomInt(4, 12)}-${getRandomInt(2, 28)}`,
      });

      // 作成者は必ずメンバーに含める
      matchGroupMembers.push({
        match_group_id: matchGroupId,
        user_id: user.user_id,
      });
      const memberIds: string[] = [user.user_id];

      const numOfMembers = getRandomInt(2, 8);
      while (memberIds.length < numOfMembers) {
        const member = users[Math.floor(Math.random() * users.length)];
        if (
          !memberIds.includes(member.user_id) &&
          Number(member.entry_date.slice(0, 4)) <= createdYear
        ) {
          matchGroupMembers.push({
            match_group_id: matchGroupId,
            user_id: member.user_id,
          });
          memberIds.push(member.user_id);
        }
      }
      // 100万件ごとにcsvに書き出す
      if (matchGroupMembers.length >= 1000000) {
        fs.appendFileSync(
          "/csv/match_group_member_init.csv",
          stringify(matchGroupMembers)
        );
        matchGroupMembers = [];
      }
    }
  }

  fs.appendFileSync("/csv/match_group_init.csv", stringify(matchGroups));
  fs.appendFileSync(
    "/csv/match_group_member_init.csv",
    stringify(matchGroupMembers)
  );
};

const createCEO = () => {
  const userName = createName();

  const hash = crypto.createHash("sha256");
  hash.update("pass0");
  const hashPassword = hash.digest("hex");

  const user: User[] = [
    {
      user_id: uuidv4(),
      employee_id: "popy0",
      user_name: userName.userName,
      kana: userName.kana,
      mail: "popy0@example.com",
      password: hashPassword,
      entry_date: "1980-04-01",
      office_id: offices[Math.floor(Math.random() * offices.length)].office_id,
      user_icon_id: files[Math.floor(Math.random() * files.length)].file_id,
      goal: "持続的成長と高い顧客満足度を実現するために企業努力を続ける。",
    },
  ];

  const department: Department[] = [
    {
      department_id: uuidv4(),
      department_name: "",
      active: true,
    },
  ];

  const role: Role[] = [
    {
      role_id: uuidv4(),
      role_name: "社長",
      active: true,
    },
  ];

  const departmentRoleMember: DepartmentRoleMember[] = [
    {
      department_id: department[0].department_id,
      role_id: role[0].role_id,
      user_id: user[0].user_id,
      entry_date: user[0].entry_date,
      belong: true,
    },
  ];

  fs.appendFileSync("/csv/user_init.csv", stringify(user));
  fs.appendFileSync("/csv/department_init.csv", stringify(department));
  fs.appendFileSync("/csv/role_init.csv", stringify(role));
  fs.appendFileSync(
    "/csv/department_role_member_init.csv",
    stringify(departmentRoleMember)
  );
};

const createTestSession = () => {
  fs.appendFileSync(
    "/csv/session_init.csv",
    stringify([
      {
        session_id: "test-session-id",
        user_id: "test-user-id",
        created_at: "2020-01-01",
      },
    ])
  );
};

const main = () => {
  console.log(new Date(), "start to create departments data");
  createDepartments();
  console.log(new Date(), "end to create departments data");
  console.log(new Date(), "start to create roles data");
  createRoles();
  console.log(new Date(), "end to create roles data");
  console.log(new Date(), "start to create offices data");
  createOffices();
  console.log(new Date(), "end to create offices data");
  console.log(new Date(), "start to create files data");
  createFiles();
  console.log(new Date(), "end to create files data");
  console.log(new Date(), "start to create skills data");
  createSkills();
  console.log(new Date(), "end to create skills data");
  console.log(new Date(), "start to create users data");
  createUsers();
  console.log(new Date(), "end to create users data");
  console.log(new Date(), "start to create skill_members data");
  createSkillMembers();
  console.log(new Date(), "end to create skill_members data");
  console.log(new Date(), "start to create department_role_members data");
  createDepartmentRoleMembers();
  console.log(new Date(), "end to create department_role_members  data");
  console.log(new Date(), "start to create match_groups data");
  createMatchGroups();
  console.log(new Date(), "end to create match_groups data");
  console.log(new Date(), "start to create ceo data");
  createCEO();
  console.log(new Date(), "end to create ceo data");
  console.log(new Date(), "start to create session data");
  createTestSession();
  console.log(new Date(), "end to create session data");
};

main();
