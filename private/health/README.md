# Private health checkup documents

원본은 개인 아카이브가 진실 소스입니다.

`D:\개인\04_Personal\04. Health\1. 건강검진\`

사이트에는 메타데이터(`src/content/health/checkups.json`)와
선택적으로 동기화된 PDF 사본만 둡니다.

## Sync

```bash
npx tsx scripts/sync-health-from-archive.ts
```

PDF는 gitignore 대상입니다. 비밀번호는 저장하지 않습니다.
암호 PDF는 로컬에서 연 뒤 해석하세요.

## 파일명

`{slug}-{kind}.pdf`  
예: `2025-02-07-kmi-result.pdf`, `2025-02-07-kmi-extra.pdf`
