const BASE_URL = 'http://192.168.30.195:1010'

export const LOGIN = `${BASE_URL}/api/v1/auth/login`;/*  POST */
/*
parameter:
- username: string (body) (required)
- password: string (body) (required)

respond:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDg5NDg1ODMsInN1YiI6IjIifQ.kiKbi-GXR__KxQUgMU00UVKVK39ZETzrQx3cRg3N7RY",
  "token_type": "bearer"
}
 */     

export const REGISTER = `${BASE_URL}/api/v1/auth/register`; /* POST */
/*
parameter:
- username: string (body) (required)
- password: string (body) (required)
- role: string (body) (required) (student/class_leader/teacher/admin)

respond:
{
  "success": true,
  "message": "Đăng ký thành công",
  "payload": {
    "user": {
      "username": "dat"
    }
  }
}
*/

export const GET_USER_INFO = `${BASE_URL}/api/v1/auth/me`; /* GET */

export const GET_CRITERIA = `${BASE_URL}/api/v1/criteria`; /* GET */
/*
parameter:
- semester: interger (query) (required) ex: 20242
- subcriteria_id: integer (query) (required) ex: 9

respond:
  "success": true,
  "message": "Get criteria successfully",
  "criterias": [
    {
      "id": 1,
      "name": "Đánh giá về ý thức tham gia học tập",
      "min_score": 0,
      "max_score": 20
    },
    {
      "id": 2,
      "name": "Đánh giá về ý thức chấp hành nội quy, quy chế, quy định trong Học viện",
      "min_score": 0,
      "max_score": 25
    },
    {
      "id": 3,
      "name": "Đánh giá về ý thức và kết quả tham gia hoạt động chính trị - xã hội, văn hóa, thể thao, phòng chống tệ nạn",
      "min_score": 0,
      "max_score": 20
    },
    {
      "id": 4,
      "name": "Đánh giá ý thức công dân trong quan hệ cộng đồng",
      "min_score": 0,
      "max_score": 25
    },
    {
      "id": 5,
      "name": "Đánh giá về ý thức và kết quả tham gia phụ trách lớp, đoàn thể và thành tích học tập, rèn luyện",
      "min_score": 0,
      "max_score": 10
    }
  ]
}
*/

export const GET_SUBCRITERIA = `${BASE_URL}/api/v1/subcriteria`; /* GET */
/*
parameter:
- criteria_id: integer (query) (required)

respond:
{
  "success": true,
  "message": "Get subcriteria successfully",
  "subcriterias": [
    {
      "id": 1,
      "criteria_id": 1,
      "name": "Ý thức và thái độ trong học tập",
      "editable": true,
      "required_evidence": false,
      "min_score": 0,
      "max_score": 3
    },
    {
      "id": 2,
      "criteria_id": 1,
      "name": "Kết quả học tập trong kỳ học",
      "editable": true,
      "required_evidence": false,
      "min_score": 0,
      "max_score": 10
    },
    {
      "id": 3,
      "criteria_id": 1,
      "name": "Ý thức chấp hành tốt nội quy về các kỳ thi",
      "editable": true,
      "required_evidence": false,
      "min_score": -4,
      "max_score": 4
    },
    {
      "id": 4,
      "criteria_id": 1,
      "name": "Ý thức và thái độ tham gia các hoạt động ngoại khóa, nghiên cứu, chuyên môn, CLB",
      "editable": true,
      "required_evidence": false,
      "min_score": 0,
      "max_score": 2
    },
    {
      "id": 5,
      "criteria_id": 1,
      "name": "Tinh thần vượt khó, phấn đấu trong học tập",
      "editable": true,
      "required_evidence": false,
      "min_score": 0,
      "max_score": 1
    }
  ]
*/

export const GET_USER_SUBCRITERIA = `${BASE_URL}/api/v1/user-subcriteria`; /* GET */
/*
parameter:
- subcriteria_id: integer (query) (required)
- semester: integer (query) (required)

respond:
{
  "message": "Get user subcriteria scores successfully",
  "data": {
    "self_score": null,
    "class_leader_score": null,
    "teacher_score": null,
    "review_by": "pending",
    "last_score": null
  }
}
*/

export const UPDATE_USER_SUBCRITERIA = `${BASE_URL}/api/v1/user-subcriteria`; /* PUT */
/*
parameter:
- subcriteria_id: integer (body) (required)
- score: integer (body) (required)
- semester: integer (body) (required)
- user_id: integer (body) (required)

*/


export const UPDATE_CRITERIA = `${BASE_URL}/api/v1/criteria`; /* PUT */
/** 
parameter:
- id: integer (body) (required)
- score: integer (body) (required)
- semester: integer (body) (required)
- user_id: integer (body) (required)
 */


export const GET_EVIDENCE = `${BASE_URL}/api/v1/evidence`; /* GET */
/*
parameter:
- semester: integer (query) (required)
- subcriteria_id: integer (query) (optional)
respond:
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "evidence": [
      {
        "id": 4,
        "user_id": 2,
        "subcriteria_id": 1,
        "semester": 20242,
        "description": "qqqqqqq",
        "file_path": "/backend/static/evidence/20242/2/2_1_1748944047.png",
        "status": "pending"
      }
    ]
  }
 */
export const UPDATE_EVIDENCE = `${BASE_URL}/api/v1/evidence`; /* PUT */
/*
parameter:
evidence_data(object)(body):
{
  "id": 0,
  "subcriteria_id": 0,
  "semester": 0,
  "description": "string"
}

file: string($binary) (body)
 */

export const SUBMIT_EVIDENCE = `${BASE_URL}/api/v1/evidence`; /* POST */
/*
parameter:
- subcriteria_id: integer (query) (required)
- semester: integer (query) (required) example: 20242
- description: string (query) (required)

file: string($binary) (body)
 */

export const VERIFY_EVIDENCE = `${BASE_URL}/api/v1/evidence/verify`; /* PUT */
/*
parameter:
- evidence_id: interger (query) required
- status: string (approved/rejected) required
 */

export const GET_DASHBOARD_CRITERIA = `${BASE_URL}/api/v1/dashboard/criteria`; /* GET */
/*
parameter:
- review_by: string (self/class_leader/teacher) required
- return_count: boolean (true/false) required default: false
- semester: integer (query) required

respond:
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "criteria": []
  }
}
*/    





export const GET_DASHBOARD_EVIDENCE = `${BASE_URL}/api/v1/dashboard/evidence`; /* GET */
/*
parameter:
- status: string (query ) (pending/approved/rejected) required
- return_count: boolean (true/false) required default: false (trả về số lượng nếu là true)
- semester: integer (query) required



respond:
return_count: true
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "evidence": 5
  }
}

return_count: false
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "evidence": [
      {
        "id": 3,
        "user_id": 7,
        "subcriteria_id": 9,
        "semester": 20242,
        "description": "oiadijwaojodjsiijdowasd",
        "file_path": "/backend/static/evidence/20242/7/7_9_1748943313.pdf",
        "status": "pending"
      },
      {
        "id": 4,
        "user_id": 2,
        "subcriteria_id": 1,
        "semester": 20242,
        "description": "qqqqqqq",
        "file_path": "/backend/static/evidence/20242/2/2_1_1748944047.png",
        "status": "pending"
      },
      {
        "id": 5,
        "user_id": 2,
        "subcriteria_id": 8,
        "semester": 20242,
        "description": "aaaaaaaa",
        "file_path": "/backend/static/evidence/20242/2/2_8_1748944490.png",
        "status": "pending"
      },
      {
        "id": 6,
        "user_id": 2,
        "subcriteria_id": 9,
        "semester": 20242,
        "description": "aaa",
        "file_path": "/backend/static/evidence/20242/2/2_9_1748950691.png",
        "status": "pending"
      },
      {
        "id": 7,
        "user_id": 2,
        "subcriteria_id": 11,
        "semester": 20242,
        "description": "aaaaaaaa",
        "file_path": "/backend/static/evidence/20242/2/2_11_1748950858.png",
        "status": "pending"
      }
    ]
  }
}
*/



export const GET_USER_ALL = `${BASE_URL}/api/v1/user`; /* GET */
/*
parameter:
offset: integer (query) (optional) default: 0
limit: integer (query) (optional) default: 10
return_count: boolean (query) (optional) default: false

respond:
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "created_at": "2025-06-02 07:53:12"
      },
      {
        "id": 2,
        "username": "duy",
        "role": "class_leader",
        "created_at": "2025-06-02 08:13:42"
      }
    ]
  }
}
*/

export const UPDATE_USER = `${BASE_URL}/api/v1/user`; /* PUT */
/*
parameter:
- id: integer (body) (required)
- username: string (body) (required)
- role: string (body) (required) (student/class_leader/teacher/admin)
- password: string (body) (required) (optional for update, required for create)
*/

export const GET_RECOMMENDATION = `${BASE_URL}/api/v1/recommend`; /* GET */
/*
respond:
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "payload": {
    "recommendations": {
      "message": "Dưới đây là các gợi ý để bạn cải thiện điểm rèn luyện:\n\n- **Tuyên truyền tích cực hình ảnh Học viện/Khoa trên MXH**: Bạn hiện có 0 điểm. Cần thêm 3 bài đăng tích cực về Học viện/Khoa trên mạng xã hội. Hãy đăng bài kèm hashtag và chụp ảnh làm minh chứng.\n\n- **Tham gia hội thảo việc làm, định hướng nghề nghiệp**: Hiện tại chưa có sự kiện nào trong tuần này, bạn có thể cải thiện tiêu chí này sau.\n\n- **Tham gia công tác xã hội như hiến máu, ủng hộ người nghèo,...**: Bạn nên tham gia các hoạt động công tác xã hội như hiến máu, ủng hộ người nghèo. Bạn cũng có thể quyên góp qua ứng dụng ngân hàng online và chụp lại biên nhận để nộp minh chứng.\n\n- **Sinh viên đạt thành tích đặc biệt trong học tập, rèn luyện**: Hãy tham gia các cuộc thi học thuật, nghiên cứu khoa học hoặc hoạt động rèn luyện cấp Học viện để có cơ hội đạt điểm tối đa."
    }
  }
}
*/