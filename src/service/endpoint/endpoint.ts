const BASE_URL = 'http://192.168.30.195:1010'

export const LOGIN = `${BASE_URL}/api/v1/auth/login`;/*  POST */
/*
parameter:
- username: string (body) (required)
- password: string (body) (required)

respond:
{
  "success": true,
  "message": "Đăng nhập thành công",
  "payload": {
    "access_token": "",
    "refresh_token": "",
    "token_type": "bearer"
  }
 */     

export const GET_USER_INFO = `${BASE_URL}/api/v1/auth/me`; /* GET */

export const GET_CRITERIA = `${BASE_URL}/api/v1/criteria`; /* GET */
/*
parameter:
- semester: interger (query) (required) ex: 20242

respond:
{
    "success": true,
    "message": "Lấy tiêu chí thành công",
    "payload": {
        "criteria": {
            "1": {
                "id": 1,
                "name": "Đánh giá về ý thức tham gia học tập",
                "min_score": 0,
                "max_score": 20,
                "subcriteria": {
                    "1": {
                        "id": 1,
                        "name": "Ý thức và thái độ trong học tập",
                        "min_score": 0,
                        "max_score": 3,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "2": {
                        "id": 2,
                        "name": "Kết quả học tập trong kỳ học",
                        "min_score": 0,
                        "max_score": 10,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "3": {
                        "id": 3,
                        "name": "Ý thức chấp hành tốt nội quy về các kỳ thi",
                        "min_score": -4,
                        "max_score": 4,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "4": {
                        "id": 4,
                        "name": "Ý thức và thái độ tham gia các hoạt động ngoại khóa, nghiên cứu, chuyên môn, CLB",
                        "min_score": 0,
                        "max_score": 2,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "5": {
                        "id": 5,
                        "name": "Tinh thần vượt khó, phấn đấu trong học tập",
                        "min_score": 0,
                        "max_score": 1,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    }
                }
            },
            "2": {
                "id": 2,
                "name": "Đánh giá về ý thức chấp hành nội quy, quy chế, quy định trong Học viện",
                "min_score": 0,
                "max_score": 25,
                "subcriteria": {
                    "6": {
                        "id": 6,
                        "name": "Thực hiện nghiêm túc các nội quy, quy chế của Học viện",
                        "min_score": 0,
                        "max_score": 15,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "7": {
                        "id": 7,
                        "name": "Thực hiện quy định về nội trú, ngoại trú",
                        "min_score": -5,
                        "max_score": 0,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "8": {
                        "id": 8,
                        "name": "Tham gia đầy đủ các buổi họp lớp/sinh hoạt đoàn thể",
                        "min_score": 0,
                        "max_score": 5,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "9": {
                        "id": 9,
                        "name": "Tham gia hội thảo việc làm, định hướng nghề nghiệp",
                        "min_score": 0,
                        "max_score": 5,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    }
                }
            },
            "3": {
                "id": 3,
                "name": "Đánh giá về ý thức và kết quả tham gia hoạt động chính trị - xã hội, văn hóa, thể thao, phòng chống tệ nạn",
                "min_score": 0,
                "max_score": 20,
                "subcriteria": {
                    "10": {
                        "id": 10,
                        "name": "Tham gia đầy đủ các hoạt động chính trị, xã hội, văn hóa, thể thao,...",
                        "min_score": 0,
                        "max_score": 10,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "11": {
                        "id": 11,
                        "name": "Tham gia công tác xã hội như hiến máu, ủng hộ người nghèo,...",
                        "min_score": 0,
                        "max_score": 4,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "12": {
                        "id": 12,
                        "name": "Tuyên truyền tích cực hình ảnh Học viện/Khoa trên MXH",
                        "min_score": 0,
                        "max_score": 3,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "13": {
                        "id": 13,
                        "name": "Tích cực phòng chống tội phạm, tệ nạn, báo cáo hành vi sai phạm",
                        "min_score": 0,
                        "max_score": 3,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "14": {
                        "id": 14,
                        "name": "Đưa thông tin sai lệch, bình luận tiêu cực về Học viện/Khoa",
                        "min_score": -10,
                        "max_score": 0,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    }
                }
            },
            "4": {
                "id": 4,
                "name": "Đánh giá ý thức công dân trong quan hệ cộng đồng",
                "min_score": 0,
                "max_score": 25,
                "subcriteria": {
                    "15": {
                        "id": 15,
                        "name": "Chấp hành chủ trương, pháp luật của Nhà nước, Học viện, địa phương",
                        "min_score": 0,
                        "max_score": 8,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "16": {
                        "id": 16,
                        "name": "Tuyên truyền chủ trương, vệ sinh môi trường, ý thức cộng đồng",
                        "min_score": 0,
                        "max_score": 5,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "17": {
                        "id": 17,
                        "name": "Quan hệ đúng mực với giảng viên, cán bộ Học viện",
                        "min_score": 0,
                        "max_score": 5,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "18": {
                        "id": 18,
                        "name": "Quan hệ tốt với bạn bè, tinh thần giúp đỡ lẫn nhau",
                        "min_score": 0,
                        "max_score": 5,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "19": {
                        "id": 19,
                        "name": "Được biểu dương trong hoạt động công dân cộng đồng",
                        "min_score": 0,
                        "max_score": 2,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "20": {
                        "id": 20,
                        "name": "Vi phạm an ninh, trật tự, ATGT",
                        "min_score": -5,
                        "max_score": 0,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    }
                }
            },
            "5": {
                "id": 5,
                "name": "Đánh giá về ý thức và kết quả tham gia phụ trách lớp, đoàn thể và thành tích học tập, rèn luyện",
                "min_score": 0,
                "max_score": 10,
                "subcriteria": {
                    "21": {
                        "id": 21,
                        "name": "Sinh viên được Học viện phân công làm lớp trưởng, lớp phó; bí thư, phó bí thư chi đoàn, BCH đoàn Học viện/khoa; BCH Hội sinh viên Học viện/khoa; chủ nhiệm, phó chủ nhiệm các các Câu lạc bộ, đội nhóm trực thuộc Học viện/khoa được tập thể sinh viên và đơn vị quản lý ghi nhận hoàn thành nhiệm vụ.",
                        "min_score": 0,
                        "max_score": 4,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "22": {
                        "id": 22,
                        "name": "Thành viên tham gia các Câu lạc bộ, đội nhóm trực thuộc Học viện /khoa được tập thể sinh viên và đơn vị quản lý ghi nhận hoàn thành tốt nhiệm vụ; sinh viên tham gia tổ chức các chương trình, là cộng tác viên tham gia tích cực vào các hoạt động chung cấp Học viện, khoa.",
                        "min_score": 0,
                        "max_score": 3,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    },
                    "23": {
                        "id": 23,
                        "name": "Sinh viên đạt thành tích đặc biệt trong học tập, rèn luyện",
                        "min_score": 0,
                        "max_score": 3,
                        "self_score": null,
                        "class_leader_score": null,
                        "teacher_score": null
                    }
                }
            }
        }
    }
}
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
respond:
{
    "success": true,
    "message": "Lấy dữ liệu thành công",
    "payload": {
        "evidence": []
    }
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
evidence_data(object)(body):
{
  "id": 0,
  "subcriteria_id": 0,
  "semester": 0,
  "description": "string"
}

file: string($binary) (body)
 */

export const VERIFY_EVIDENCE = `${BASE_URL}/api/v1/evidence/verify`; /* PUT */
/*
parameter:
- evidence_id: interger (query) required
- status: string (approved/rejected) required
 */