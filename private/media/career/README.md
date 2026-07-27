# Career media

이직 패키지·지원·어학 첨부. **D:\개인\02_Career 원본은 그대로** 두고, 제출용만.

```text
private/media/career/
  package/{slug}/          ← 마스터 이력서·포트폴리오
  applications/{slug}/     ← 회사별 지원 서류
  language/{slug}/         ← 어학 성적표
```

- API: `GET|PUT /api/career/{space}/{entry}/files`
- 학력·자격 증명서는 여기가 아니라 `private/documents` + Career「자격·학력」슬롯
- 급여·재직은 Documents
