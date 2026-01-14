# [삽질 로그] 수어 사전 데이터 크롤러 & AWS S3 연동기

> "코드는 항상 거짓말을 하지 않지만, 설정은 종종 나를 속인다."
> 이번 프로젝트에서 수어 영상 데이터를 수집하고 S3에 적재하며 겪은 주요 트러블 슈팅 기록.

---

## 🚨 1. [핵심] AWS S3 업로드 권한 거부 (AccessDenied)

가장 시간을 많이 잡아먹었던 이슈. 로컬에서 데이터는 다 가져왔는데 S3 문지기가 문을 안 열어줌.

### **⚠️ 문제 (Problem)**
`auto_collector.py` 스크립트가 로컬에서 수어 동영상을 성공적으로 찾았음에도 불구, S3 업로드 단계(`PutObject`)에서 `ClientError: An error occurred (AccessDenied)` 발생.

### **🕵️ 원인 (Cause)**
**"권한 경계(Permissions Boundary)의 함정"**
AWS IAM 사용자(`uploader`)를 확인해보니:
1.  **권한 경계(Boundary)**에는 `AmazonS3FullAccess`가 설정되어 있었음. (이게 권한이 있는 것처럼 착각하게 만듦)
2.  하지만 정작 **권한 정책(Permissions Policy)**은 **(0)개** 로 비어 있었음.
3.  비유하자면 **"이 사람은 전권을 가질 '자격'은 있다(Boundary)"**고 써놓고, 정작 **"출입증(Policy)"은 안 준 상태.**

### **✅ 해결 (Solution)**
AWS IAM 콘솔 > 사용자 권한 설정에서 `AmazonS3FullAccess` 정책을 **'직접 연결(Attach policies directly)'** 방식으로 추가함.

### **💡 결과 (Result)**
권한 부여 즉시 스크립트 재실행. `병원.mp4`, `행복.mp4` 등 23개의 수어 영상 파일이 `sondam-videos-2025` 버킷에 시원하게 업로드됨.

---

## 🛠 2. macOS Selenium ChromeDriver 호환성 및 권한 이슈

맥(Mac) 환경에서 자동화 스크립트를 돌릴 때만 발생하는 특유의 까다로움.

### **⚠️ 문제 (Problem)**
스크립트 실행 시 `SessionNotCreatedException` 에러 발생하거나, 드라이버 실행 파일이 운영체제 보안에 의해 막힘 (`Permission Denied`).

### **🕵️ 원인 (Cause)**
1.  **버전 불일치**: 로컬 크롬 버전은 143인데, `webdriver_manager`가 기본으로 가져오는 드라이버 버전과 맞지 않음.
2.  **macOS 보안(Quarantine)**: `chromedriver` 바이너리를 다운로드 받았는데, 맥이 이를 "확인되지 않은 개발자의 앱"으로 인식해 격리(Quarantine)함.

### **✅ 해결 (Solution)**
1.  **버전 명시**: `ChromeDriverManager(driver_version="143.0.xxx")` 처럼 현재 설치된 크롬 버전 명시.
2.  **권한 강제 부여**: 파이썬 스크립트 내에서 `chmod` 및 `xattr` 명령어를 실행하여 격리 속성 제거.

```python
# 자동화된 해결 스크립트 예시
os.chmod(path, 0o755)
subprocess.run(["xattr", "-d", "com.apple.quarantine", path])
```

---

## 🔄 3. Selenium 검색 실패 → Requests로의 전환

"브라우저를 띄우는 게 능사가 아니다."

### **⚠️ 문제 (Problem)**
Selenium으로 `https://sldict.korean.go.kr` 접속 후 검색어를 입력했으나, 결과가 0건으로 나오는 현상 지속. 헤드리스 모드 탐지 혹은 페이지 로딩 타이밍 이슈로 추정.

### **🕵️ 원인 (Cause)**
웹사이트가 복잡한 JavaScript(`SearchIntegration` 함수 등)로 동작하며, 단순 `send_keys(Keys.RETURN)`으로는 검색 트리거가 제대로 걸리지 않음. 브라우저 구동 비용도 너무 큼.

### **✅ 해결 (Solution)**
**Selenium 과감히 포기. `requests` + `BeautifulSoup` 조합으로 변경.**
1.  `requests.Session()`을 사용해 쿠키 세션 유지.
2.  브라우저 개발자 도구(Network 탭)를 분석해 검색(`searchAllList.do`)과 상세 페이지(`signContentsView.do`)의 **HIDDEN Form Data** 구조 파악.
3.  직접 POST 요청을 날려서 HTML 파싱. 속도는 10배 빨라지고 결과는 정확해짐.

---

## 🔐 4. S3 Bucket ACL 설정 충돌

"시키는 대로 public-read를 넣었더니 오히려 에러가?"

### **⚠️ 문제 (Problem)**
업로드 시 `ExtraArgs={'ACL': 'public-read'}`를 넣자 `AccessControlListNotSupported` 에러 발생.

### **🕵️ 원인 (Cause)**
사용자의 S3 버킷 설정이 **"Bucket Ownership Enforced (버킷 소유자 시행)"**로 되어 있었음.
이 설정이 켜져 있으면 ACL(Access Control List) 자체가 비활성화되어, 개별 파일에 `public-read` 권한을 설정하려고 하면 에러가 남.

### **✅ 해결 (Solution)**
코드에서 `ACL` 파라미터 제거. ACL 대신 **버킷 정책(Bucket Policy)**으로 퍼블릭 접근을 제어하거나, IAM 권한으로 해결하는 것이 최신 AWS 보안 권장 사항임.

```python
# 수정 전
s3.upload_fileobj(..., ExtraArgs={'ACL': 'public-read', ...})

# 수정 후 (성공)
s3.upload_fileobj(..., ExtraArgs={'ContentType': content_type})
```

---

## 🚫 5. S3 403 Forbidden과 퍼블릭 액세스 차단

"업로드는 됐는데 왜 볼 수가 없니..."

### **⚠️ 문제 (Problem)**
`dictionary_s3.json`에 있는 영상 URL(`https://.../안녕.mp4`)로 접속하니 `403 Forbidden` 에러가 뜨며 영상 재생 불가.

### **🕵️ 원인 (Cause)**
**ACL을 껐으면 정책(Policy)으로 문을 열어야 한다.**
1.  앞선 4번 이슈에서 ACL(`public-read`)을 코드에서 뺐기 때문에, 업로드된 파일은 기본적으로 **비공개** 상태임.
2.  이를 공개하려면 **버킷 정책(Bucket Policy)**을 추가해야 함.
3.  게다가 AWS 기본 보안 설정인 **"퍼블릭 액세스 차단(Block Public Access)"** 스위치가 켜져 있어서, 정책을 넣어도 무시됨.

### **✅ 해결 (Solution)**
1.  **버킷 정책 추가**: `s3:GetObject` 권한을 모든 사용자(`*`)에게 허용하는 JSON 정책 적용.
2.  **퍼블릭 액세스 차단 해제**: S3 콘솔 > 권한 탭에서 "모든 퍼블릭 액세스 차단"을 **OFF**로 변경.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sondam-videos-2025/*"
        }
    ]
}
```

### **💡 최종 결과 (Final Result)**
**버킷 정책 적용 후 영상 스트리밍 및 다운로드가 정상적으로 작동함.**

- **크롤링**: 성공 (23개 단어 수집 완료)
- **업로드**: 성공 (ACL 제거로 권한 문제 해결)
- **재생**: 성공 (Bucket Policy + BPA 해제로 웹 스트리밍 원활)

---

### 📝 마치며
크롤링 봇 하나 만드는데 **OS 권한(Mac) -> 브라우저 드라이버(Chrome) -> 웹 서버 차단(WAF) -> 클라우드 권한(AWS IAM) -> 스토리지 정책(S3 ACL)** 까지 풀스택으로 얻어맞음. 역시 "Hello World" 다음은 "Access Denied"가 국룰.
