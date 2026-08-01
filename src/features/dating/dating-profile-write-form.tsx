"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parseDuoProfilePaste } from "@/lib/dating/parse-duo-paste";
import {
  datingPhotoSrc,
} from "@/lib/dating/labels";
import { cn } from "@/lib/utils/cn";
import type { DatingProfileWriteDraft } from "@/lib/write/dating-drafts";
import {
  DATING_STATUS_LABEL,
  DATING_STATUS_ORDER,
  type DatingProfileStatus,
} from "@/types/dating";

type DatingProfileWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: DatingProfileWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

const sectionClass = "mt-10 border-t border-[var(--color-border)]/70 pt-8";

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatingProfileWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: DatingProfileWriteFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [metAt, setMetAt] = useState(draft?.metAt || todayIso());
  const [memberId, setMemberId] = useState(draft?.memberId ?? "");
  const [gender, setGender] = useState(draft?.gender ?? "여성");
  const [birthYearLabel, setBirthYearLabel] = useState(
    draft?.birthYearLabel ?? "",
  );
  const [surname, setSurname] = useState(draft?.surname ?? "");
  const [residence, setResidence] = useState(draft?.residence ?? "");
  const [religion, setReligion] = useState(draft?.religion ?? "");
  const [height, setHeight] = useState(draft?.height ?? "");
  const [hobby, setHobby] = useState(draft?.hobby ?? "");
  const [highSchool, setHighSchool] = useState(draft?.highSchool ?? "");
  const [university, setUniversity] = useState(draft?.university ?? "");
  const [graduate, setGraduate] = useState(draft?.graduate ?? "");
  const [company, setCompany] = useState(draft?.company ?? "");
  const [department, setDepartment] = useState(draft?.department ?? "");
  const [title, setTitle] = useState(draft?.title ?? "");
  const [field, setField] = useState(draft?.field ?? "");
  const [location, setLocation] = useState(draft?.location ?? "");
  const [familyFather, setFamilyFather] = useState(draft?.familyFather ?? "");
  const [familyMother, setFamilyMother] = useState(draft?.familyMother ?? "");
  const [familyOther, setFamilyOther] = useState(draft?.familyOther ?? "");
  const [intro, setIntro] = useState(draft?.intro ?? "");
  const [idealType, setIdealType] = useState(draft?.idealType ?? "");
  const [managerNote, setManagerNote] = useState(draft?.managerNote ?? "");
  const [contactName, setContactName] = useState(draft?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(draft?.contactPhone ?? "");
  const [status, setStatus] = useState<DatingProfileStatus>(
    draft?.status ?? "new",
  );
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug] = useState(draft?.slug ?? "");
  const existingPhotos = draft?.photos ?? [];
  const [pasteText, setPasteText] = useState("");
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);

  function applyPasteFill() {
    setError(null);
    setPasteMessage(null);
    const { draft: parsed, filledKeys } = parseDuoProfilePaste(pasteText);
    if (filledKeys.length === 0) {
      setPasteMessage("채울 필드를 찾지 못했습니다. 텍스트 형식을 확인하세요.");
      return;
    }

    if (parsed.memberId != null) setMemberId(parsed.memberId);
    if (parsed.gender != null) setGender(parsed.gender);
    if (parsed.birthYearLabel != null) setBirthYearLabel(parsed.birthYearLabel);
    if (parsed.surname != null) setSurname(parsed.surname);
    if (parsed.residence != null) setResidence(parsed.residence);
    if (parsed.religion != null) setReligion(parsed.religion);
    if (parsed.height != null) setHeight(parsed.height);
    if (parsed.hobby != null) setHobby(parsed.hobby);
    if (parsed.highSchool != null) setHighSchool(parsed.highSchool);
    if (parsed.university != null) setUniversity(parsed.university);
    if (parsed.graduate != null) setGraduate(parsed.graduate);
    if (parsed.company != null) setCompany(parsed.company);
    if (parsed.department != null) setDepartment(parsed.department);
    if (parsed.title != null) setTitle(parsed.title);
    if (parsed.field != null) setField(parsed.field);
    if (parsed.location != null) setLocation(parsed.location);
    if (parsed.familyFather != null) setFamilyFather(parsed.familyFather);
    if (parsed.familyMother != null) setFamilyMother(parsed.familyMother);
    if (parsed.familyOther != null) setFamilyOther(parsed.familyOther);
    if (parsed.intro != null) setIntro(parsed.intro);
    if (parsed.idealType != null) setIdealType(parsed.idealType);
    if (parsed.managerNote != null) setManagerNote(parsed.managerNote);

    setPasteMessage(`${filledKeys.length}개 필드를 채웠습니다. 아래를 검수 후 저장하세요.`);
  }

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        WRITE_SECRET이 설정되지 않았습니다.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        프로필 작성은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/dating" className="underline underline-offset-4">
          Dating에서 로그인
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "profile");
      body.set("mode", mode);
      if (slug) body.set("slug", slug);
      body.set("metAt", metAt);
      body.set("memberId", memberId);
      body.set("gender", gender);
      body.set("birthYearLabel", birthYearLabel);
      body.set("surname", surname);
      body.set("residence", residence);
      body.set("religion", religion);
      body.set("height", height);
      body.set("hobby", hobby);
      body.set("highSchool", highSchool);
      body.set("university", university);
      body.set("graduate", graduate);
      body.set("company", company);
      body.set("department", department);
      body.set("title", title);
      body.set("field", field);
      body.set("location", location);
      body.set("familyFather", familyFather);
      body.set("familyMother", familyMother);
      body.set("familyOther", familyOther);
      body.set("intro", intro);
      body.set("idealType", idealType);
      body.set("managerNote", managerNote);
      body.set("contactName", contactName);
      body.set("contactPhone", contactPhone);
      body.set("status", status);
      body.set("note", note);

      const files = fileRef.current?.files;
      if (files) {
        for (const file of Array.from(files)) {
          body.append("photos", file);
        }
      }

      const response = await fetch("/api/write/dating", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push(data?.href ?? "/dating");
      router.refresh();
    });
  }

  return (
    <form className="mt-10" onSubmit={onSubmit}>
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        Personal · Dating
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
        {mode === "new" ? "새 프로필" : "프로필 수정"}
      </h2>

      <section className="mt-8 rounded-md border border-[var(--color-border)]/70 p-4 sm:p-5">
        <p className={labelClass}>프로필 텍스트 붙여넣기</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          듀오 「님의 PROFILE」 전문을 붙여 넣고 폼에 채운 뒤, 아래에서 검수해
          저장하세요. 받은 날짜·사진은 직접 입력합니다.
        </p>
        <textarea
          className={cn(fieldClass, "min-h-40 font-mono text-[0.8rem] leading-6")}
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          placeholder={`2010127829 님의 PROFILE\n저는 … 여성입니다.\n★ 학력사항\n…`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyPasteFill}
            className={cn(
              "inline-flex h-9 items-center px-3 text-[0.75rem] tracking-wide",
              "border border-[var(--color-border)] text-[var(--color-foreground)]",
              "transition-opacity hover:opacity-70",
            )}
          >
            폼에 채우기
          </button>
          {pasteMessage ? (
            <p className="text-sm text-[var(--color-muted)]">{pasteMessage}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>받은 날짜</span>
          <input
            type="date"
            required
            className={fieldClass}
            value={metAt}
            onChange={(event) => setMetAt(event.target.value)}
          />
        </label>
        <label className="block">
          <span className={labelClass}>회원번호</span>
          <input
            className={fieldClass}
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            placeholder="Duo 회원번호"
          />
        </label>
        <label className="block">
          <span className={labelClass}>상태</span>
          <select
            className={fieldClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as DatingProfileStatus)
            }
          >
            {DATING_STATUS_ORDER.map((id) => (
              <option key={id} value={id}>
                {DATING_STATUS_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>성별</span>
          <select
            className={fieldClass}
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          >
            <option value="여성">여성</option>
            <option value="남성">남성</option>
          </select>
        </label>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>기본정보</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>출생년도</span>
            <input
              className={fieldClass}
              value={birthYearLabel}
              onChange={(event) => setBirthYearLabel(event.target.value)}
              placeholder="1994년생"
            />
          </label>
          <label className="block">
            <span className={labelClass}>성씨</span>
            <input
              className={fieldClass}
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              placeholder="밀양 박씨"
            />
          </label>
          <label className="block">
            <span className={labelClass}>거주지</span>
            <input
              className={fieldClass}
              value={residence}
              onChange={(event) => setResidence(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>종교</span>
            <input
              className={fieldClass}
              value={religion}
              onChange={(event) => setReligion(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>키</span>
            <input
              className={fieldClass}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              placeholder="160cm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>취미</span>
            <input
              className={fieldClass}
              value={hobby}
              onChange={(event) => setHobby(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>학력</h3>
        <div className="mt-4 grid gap-5">
          <label className="block">
            <span className={labelClass}>고등학교</span>
            <input
              className={fieldClass}
              value={highSchool}
              onChange={(event) => setHighSchool(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>대학교</span>
            <input
              className={fieldClass}
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>대학원</span>
            <input
              className={fieldClass}
              value={graduate}
              onChange={(event) => setGraduate(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>직장 (현직)</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>회사</span>
            <input
              className={fieldClass}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>부서</span>
            <input
              className={fieldClass}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>직위</span>
            <input
              className={fieldClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>담당업무</span>
            <input
              className={fieldClass}
              value={field}
              onChange={(event) => setField(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>근무지</span>
            <input
              className={fieldClass}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>가족</h3>
        <div className="mt-4 grid gap-5">
          <label className="block">
            <span className={labelClass}>부</span>
            <input
              className={fieldClass}
              value={familyFather}
              onChange={(event) => setFamilyFather(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>모</span>
            <input
              className={fieldClass}
              value={familyMother}
              onChange={(event) => setFamilyMother(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>기타 (한 줄에 한 명)</span>
            <textarea
              className={cn(fieldClass, "min-h-24")}
              value={familyOther}
              onChange={(event) => setFamilyOther(event.target.value)}
              placeholder="여동생: 학력: 대학교 / 직업: 회사원"
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>소개 · 리뷰</h3>
        <div className="mt-4 grid gap-5">
          <label className="block">
            <span className={labelClass}>자기소개</span>
            <textarea
              className={cn(fieldClass, "min-h-28")}
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>희망상대</span>
            <textarea
              className={cn(fieldClass, "min-h-24")}
              value={idealType}
              onChange={(event) => setIdealType(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>매니저 리뷰</span>
            <textarea
              className={cn(fieldClass, "min-h-24")}
              value={managerNote}
              onChange={(event) => setManagerNote(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>메모</span>
            <textarea
              className={cn(fieldClass, "min-h-20")}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>만남 연락처 (선택)</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>이름</span>
            <input
              className={fieldClass}
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>휴대폰</span>
            <input
              className={fieldClass}
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              inputMode="tel"
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={labelClass}>사진</h3>
        {existingPhotos.length > 0 ? (
          <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {existingPhotos.map((photo, index) => (
              <li key={photo} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={datingPhotoSrc(photo)}
                  alt={`기존 사진 ${index + 1}`}
                  className="h-28 w-20 object-cover bg-[var(--color-border)]/40"
                />
              </li>
            ))}
          </ul>
        ) : null}
        <label className="mt-4 block">
          <span className={labelClass}>
            {mode === "existing" ? "사진 추가" : "사진 업로드"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="mt-2 block w-full text-sm text-[var(--color-muted)]"
          />
        </label>
        <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
          수정 시 새 사진은 기존 사진 뒤에 추가됩니다.
        </p>
      </section>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-10 items-center px-5 text-[0.8125rem] tracking-wide",
            "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
            "text-[var(--color-background)] transition-opacity",
            "disabled:opacity-40",
          )}
        >
          {pending ? "저장 중…" : "저장"}
        </button>
        <a
          href="/dating"
          className="text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
