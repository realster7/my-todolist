export const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'zh'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const ko = {
  'app.name': '하루하루 일정 관리',

  'header.myInfo': '내 정보',
  'header.logout': '로그아웃',
  'header.themeToLight': '라이트 모드로 전환',
  'header.themeToDark': '다크 모드로 전환',
  'header.language': '언어 선택',

  'login.title': '로그인',
  'login.submit': '로그인',
  'login.noAccount': '계정이 없으신가요?',
  'login.signUpLink': '회원가입하기',
  'login.genericError': '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',

  'signup.title': '회원가입',
  'signup.submit': '가입하기',
  'signup.haveAccount': '이미 계정이 있으신가요?',
  'signup.loginLink': '로그인하기',
  'signup.genericError': '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',

  'field.email': '이메일',
  'field.password': '비밀번호',
  'field.name': '이름',
  'field.title': '제목',
  'field.description': '설명',
  'field.startDate': '시작일',
  'field.endDate': '종료일',
  'field.category': '카테고리',
  'field.categoryDefault': '기본 (자동 지정)',

  'todoForm.requiredError': '제목/시작일/종료일을 입력해주세요.',
  'todoForm.dateOrderError': '종료일은 시작일보다 빠를 수 없습니다.',
  'todoForm.createSubmit': '등록하기',
  'todoForm.createGenericError': '할일 등록에 실패했습니다. 잠시 후 다시 시도해주세요.',
  'todoForm.editSubmit': '저장하기',
  'todoForm.editGenericError': '할일 수정에 실패했습니다. 잠시 후 다시 시도해주세요.',
  'todoForm.done': '완료 처리',
  'todoForm.delete': '삭제',
  'todoForm.deleteGenericError': '삭제에 실패했습니다. 잠시 후 다시 시도해주세요.',
  'todoForm.newTitle': '새 할일 등록',
  'todoForm.editTitle': '할일 편집',
  'todoForm.notFound': '할일을 찾을 수 없습니다.',
  'todoForm.backToList': '목록으로 돌아가기',

  'deleteModal.title': '할일을 삭제하시겠습니까?',
  'deleteModal.warning': '이 작업은 되돌릴 수 없습니다.',
  'deleteModal.cancel': '취소',
  'deleteModal.confirm': '삭제하기',

  'todoList.addButton': '+ 할일 추가',
  'todoList.empty': '등록된 할일이 없습니다. 새 할일을 추가해 보세요.',
  'todoList.greeting': '오늘도 하나씩, 화이팅 :)',
  'todoList.summary': '진행중인 할일 {inProgress}개, 지연 {overdue}개가 있어요',

  'status.all': '전체',
  'status.notStarted': '시작전',
  'status.inProgress': '진행중',
  'status.done': '완료',
  'status.overdue': '지연',

  'profile.title': '내 정보 수정',
  'profile.newPassword': '새 비밀번호 (선택)',
  'profile.save': '저장하기',
  'profile.cancel': '취소',
  'profile.requiredError': '이름 또는 새 비밀번호를 입력해주세요.',
  'profile.genericError': '정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.',

  'common.back': '뒤로가기',

  'todoList.viewList': '목록',
  'todoList.viewCalendar': '캘린더',
  'calendar.prevMonth': '이전 달',
  'calendar.nextMonth': '다음 달',
  'calendar.moreCount': '+{count}개',
} as const;

export type TranslationKey = keyof typeof ko;

const en: Record<TranslationKey, string> = {
  'app.name': 'Your Daily Planner',

  'header.myInfo': 'My Info',
  'header.logout': 'Log out',
  'header.themeToLight': 'Switch to light mode',
  'header.themeToDark': 'Switch to dark mode',
  'header.language': 'Language',

  'login.title': 'Log In',
  'login.submit': 'Log In',
  'login.noAccount': "Don't have an account?",
  'login.signUpLink': 'Sign up',
  'login.genericError': 'Login failed. Please try again shortly.',

  'signup.title': 'Sign Up',
  'signup.submit': 'Sign Up',
  'signup.haveAccount': 'Already have an account?',
  'signup.loginLink': 'Log in',
  'signup.genericError': 'Sign up failed. Please try again shortly.',

  'field.email': 'Email',
  'field.password': 'Password',
  'field.name': 'Name',
  'field.title': 'Title',
  'field.description': 'Description',
  'field.startDate': 'Start Date',
  'field.endDate': 'End Date',
  'field.category': 'Category',
  'field.categoryDefault': 'Default (auto-assigned)',

  'todoForm.requiredError': 'Please enter title, start date, and end date.',
  'todoForm.dateOrderError': 'End date cannot be earlier than start date.',
  'todoForm.createSubmit': 'Create',
  'todoForm.createGenericError': 'Failed to create todo. Please try again shortly.',
  'todoForm.editSubmit': 'Save',
  'todoForm.editGenericError': 'Failed to update todo. Please try again shortly.',
  'todoForm.done': 'Mark as done',
  'todoForm.delete': 'Delete',
  'todoForm.deleteGenericError': 'Failed to delete. Please try again shortly.',
  'todoForm.newTitle': 'New Todo',
  'todoForm.editTitle': 'Edit Todo',
  'todoForm.notFound': 'Todo not found.',
  'todoForm.backToList': 'Back to list',

  'deleteModal.title': 'Delete this todo?',
  'deleteModal.warning': 'This action cannot be undone.',
  'deleteModal.cancel': 'Cancel',
  'deleteModal.confirm': 'Delete',

  'todoList.addButton': '+ Add Todo',
  'todoList.empty': 'No todos yet. Add one to get started.',
  'todoList.greeting': "One step at a time, you've got this :)",
  'todoList.summary': 'You have {inProgress} in progress and {overdue} overdue',

  'status.all': 'All',
  'status.notStarted': 'Not Started',
  'status.inProgress': 'In Progress',
  'status.done': 'Done',
  'status.overdue': 'Overdue',

  'profile.title': 'Edit Profile',
  'profile.newPassword': 'New Password (optional)',
  'profile.save': 'Save',
  'profile.cancel': 'Cancel',
  'profile.requiredError': 'Please enter a new name or password.',
  'profile.genericError': 'Failed to update profile. Please try again shortly.',

  'common.back': 'Back',

  'todoList.viewList': 'List',
  'todoList.viewCalendar': 'Calendar',
  'calendar.prevMonth': 'Previous month',
  'calendar.nextMonth': 'Next month',
  'calendar.moreCount': '+{count} more',
};

const ja: Record<TranslationKey, string> = {
  'app.name': '一日一日のスケジュール管理',

  'header.myInfo': 'アカウント情報',
  'header.logout': 'ログアウト',
  'header.themeToLight': 'ライトモードに切り替え',
  'header.themeToDark': 'ダークモードに切り替え',
  'header.language': '言語選択',

  'login.title': 'ログイン',
  'login.submit': 'ログイン',
  'login.noAccount': 'アカウントをお持ちでないですか?',
  'login.signUpLink': '新規登録',
  'login.genericError': 'ログインに失敗しました。しばらくしてから再度お試しください。',

  'signup.title': '新規登録',
  'signup.submit': '登録する',
  'signup.haveAccount': 'すでにアカウントをお持ちですか?',
  'signup.loginLink': 'ログイン',
  'signup.genericError': '登録に失敗しました。しばらくしてから再度お試しください。',

  'field.email': 'メールアドレス',
  'field.password': 'パスワード',
  'field.name': '名前',
  'field.title': 'タイトル',
  'field.description': '説明',
  'field.startDate': '開始日',
  'field.endDate': '終了日',
  'field.category': 'カテゴリー',
  'field.categoryDefault': 'デフォルト (自動設定)',

  'todoForm.requiredError': 'タイトル・開始日・終了日を入力してください。',
  'todoForm.dateOrderError': '終了日は開始日より前にできません。',
  'todoForm.createSubmit': '登録する',
  'todoForm.createGenericError': 'タスクの登録に失敗しました。しばらくしてから再度お試しください。',
  'todoForm.editSubmit': '保存する',
  'todoForm.editGenericError': 'タスクの更新に失敗しました。しばらくしてから再度お試しください。',
  'todoForm.done': '完了にする',
  'todoForm.delete': '削除',
  'todoForm.deleteGenericError': '削除に失敗しました。しばらくしてから再度お試しください。',
  'todoForm.newTitle': '新しいタスク',
  'todoForm.editTitle': 'タスクを編集',
  'todoForm.notFound': 'タスクが見つかりません。',
  'todoForm.backToList': '一覧に戻る',

  'deleteModal.title': 'このタスクを削除しますか?',
  'deleteModal.warning': 'この操作は取り消せません。',
  'deleteModal.cancel': 'キャンセル',
  'deleteModal.confirm': '削除する',

  'todoList.addButton': '+ タスクを追加',
  'todoList.empty': 'タスクがまだありません。新しいタスクを追加してみましょう。',
  'todoList.greeting': '今日も一つずつ、頑張ろう :)',
  'todoList.summary': '進行中のタスクが{inProgress}件、期限超過が{overdue}件あります',

  'status.all': 'すべて',
  'status.notStarted': '未着手',
  'status.inProgress': '進行中',
  'status.done': '完了',
  'status.overdue': '期限超過',

  'profile.title': 'アカウント情報の編集',
  'profile.newPassword': '新しいパスワード (任意)',
  'profile.save': '保存する',
  'profile.cancel': 'キャンセル',
  'profile.requiredError': '新しい名前またはパスワードを入力してください。',
  'profile.genericError': '情報の更新に失敗しました。しばらくしてから再度お試しください。',

  'common.back': '戻る',

  'todoList.viewList': 'リスト',
  'todoList.viewCalendar': 'カレンダー',
  'calendar.prevMonth': '前の月',
  'calendar.nextMonth': '次の月',
  'calendar.moreCount': '他{count}件',
};

const zh: Record<TranslationKey, string> = {
  'app.name': '日常日程管理',

  'header.myInfo': '我的信息',
  'header.logout': '退出登录',
  'header.themeToLight': '切换到浅色模式',
  'header.themeToDark': '切换到深色模式',
  'header.language': '语言选择',

  'login.title': '登录',
  'login.submit': '登录',
  'login.noAccount': '还没有账号?',
  'login.signUpLink': '注册',
  'login.genericError': '登录失败,请稍后重试。',

  'signup.title': '注册',
  'signup.submit': '注册',
  'signup.haveAccount': '已经有账号了?',
  'signup.loginLink': '登录',
  'signup.genericError': '注册失败,请稍后重试。',

  'field.email': '邮箱',
  'field.password': '密码',
  'field.name': '姓名',
  'field.title': '标题',
  'field.description': '描述',
  'field.startDate': '开始日期',
  'field.endDate': '结束日期',
  'field.category': '分类',
  'field.categoryDefault': '默认(自动分配)',

  'todoForm.requiredError': '请输入标题/开始日期/结束日期。',
  'todoForm.dateOrderError': '结束日期不能早于开始日期。',
  'todoForm.createSubmit': '创建',
  'todoForm.createGenericError': '创建待办事项失败,请稍后重试。',
  'todoForm.editSubmit': '保存',
  'todoForm.editGenericError': '更新待办事项失败,请稍后重试。',
  'todoForm.done': '标记为完成',
  'todoForm.delete': '删除',
  'todoForm.deleteGenericError': '删除失败,请稍后重试。',
  'todoForm.newTitle': '新建待办事项',
  'todoForm.editTitle': '编辑待办事项',
  'todoForm.notFound': '未找到该待办事项。',
  'todoForm.backToList': '返回列表',

  'deleteModal.title': '确定要删除这个待办事项吗?',
  'deleteModal.warning': '此操作无法撤销。',
  'deleteModal.cancel': '取消',
  'deleteModal.confirm': '删除',

  'todoList.addButton': '+ 添加待办事项',
  'todoList.empty': '暂无待办事项,添加一个开始吧。',
  'todoList.greeting': '今天也一步一步来,加油 :)',
  'todoList.summary': '有{inProgress}个进行中、{overdue}个已逾期的待办事项',

  'status.all': '全部',
  'status.notStarted': '未开始',
  'status.inProgress': '进行中',
  'status.done': '已完成',
  'status.overdue': '已逾期',

  'profile.title': '编辑个人信息',
  'profile.newPassword': '新密码(可选)',
  'profile.save': '保存',
  'profile.cancel': '取消',
  'profile.requiredError': '请输入新姓名或新密码。',
  'profile.genericError': '更新个人信息失败,请稍后重试。',

  'common.back': '返回',

  'todoList.viewList': '列表',
  'todoList.viewCalendar': '日历',
  'calendar.prevMonth': '上个月',
  'calendar.nextMonth': '下个月',
  'calendar.moreCount': '还有{count}个',
};

export const translations: Record<Locale, Record<TranslationKey, string>> = { ko, en, ja, zh };
