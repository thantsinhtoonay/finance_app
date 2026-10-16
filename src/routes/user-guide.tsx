import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Lock,
  Megaphone,
  Receipt,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/user-guide")({
  component: UserGuidePage,
});

/* ─────────────────────────── content primitives ─────────────────────────── */

function Section({
  id,
  num,
  title,
  subtitle,
  children,
}: {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:p-7">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary">
              SECTION {num}
            </p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

/** English paragraph followed by its Burmese translation (muted). */
function Bi({ en, my }: { en: React.ReactNode; my: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm leading-relaxed">{en}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{my}</p>
    </div>
  );
}

function Sub({ en, my }: { en: string; my: string }) {
  return (
    <h3 className="mt-2 text-base font-bold sm:text-lg">
      {en}{" "}
      <span className="font-medium text-muted-foreground">· {my}</span>
    </h3>
  );
}

function Step({
  n,
  title,
  titleMy,
  children,
}: {
  n: number;
  title: string;
  titleMy: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="gradient-gold mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm">
        {n}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">
          {title}{" "}
          <span className="font-medium text-muted-foreground">· {titleMy}</span>
        </p>
        {children && (
          <div className="text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-r-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-r-xl border-l-4 border-destructive bg-destructive/5 px-4 py-3 text-sm leading-relaxed">
      {children}
    </div>
  );
}

function GuideTable({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────── the page ─────────────────────────────── */

const TOC: Array<[string, string]> = [
  ["welcome", "Welcome · မိတ်ဆက်"],
  ["register", "Create an account · အကောင့်အသစ်ဖွင့်ခြင်း"],
  ["login", "Sign in · အကောင့်ဝင်ခြင်း"],
  ["password", "Password recovery · စကားဝှက်ပြန်ယူခြင်း"],
  ["dashboard", "Dashboard · ပင်မစာမျက်နှာ"],
  ["transactions", "Add income & expense · ဝင်ငွေ/ထွက်ငွေထည့်ခြင်း"],
  ["gate", "Income-first rule · ဝင်ငွေအရင်ထည့်ရန်လိုအပ်ခြင်း"],
  ["receipts", "Receipt photos · ပြေစာပုံ"],
  ["goals", "Savings goal & budgets · စုဆောင်းငွေပန်းတိုင်နှင့်ဘတ်ဂျက်"],
  ["recurring", "Recurring entries · ထပ်တလဲလဲစာရင်းများ"],
  ["history", "History & Yearly · မှတ်တမ်းနှင့်နှစ်ချုပ်"],
  ["settings", "Settings · ဆက်တင်များ"],
  ["shortcuts", "Keyboard shortcuts · ကီးဘုတ်ဖောင်းဒါများ"],
  ["mobile", "Mobile tips · မိုဘိုင်းအသုံးပြုနည်း"],
  ["terms", "Glossary · ဝေါဟာရများ"],
  ["troubleshooting", "Troubleshooting · ပြဿနာဖြေရှင်းနည်း"],
  ["security", "Security & data · လုံခြုံရေးနှင့်ဒေတာ"],
];

function UserGuidePage() {
  return (
    <div className="scroll-smooth min-h-dvh bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border/60 bg-background-wash">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 text-center sm:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-semibold tracking-widest text-primary">
            <BookOpen className="size-3.5" />
            SHAL SU · USER GUIDE
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Shal Su
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            English & မြန်မာ အသုံးပြုသူလမ်းညွှန် — a complete guide to tracking your
            money: accounts, income & expenses, receipts, budgets, exports and

            more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button asChild size="sm" variant="outline">
              <Link to="/">
                <ChevronRight className="size-4" />
                Open Shal Su
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
              <Link to="/login">Sign in page</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8">
        {/* Table of contents */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-bold">Contents · မာတိကာ</h2>
            <ol className="mt-3 grid gap-1 sm:grid-cols-2">
              {TOC.map(([id, label], i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60 hover:text-primary"
                  >
                    <span className="w-6 shrink-0 text-right font-semibold text-primary">
                      {i + 1}.
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* 1 · Welcome */}
        <Section
          id="welcome"
          num={1}
          title="Welcome to Shal Su"
          subtitle="Shal Su မှ ကြိုဆိုပါသည်"
        >
          <Bi
            en={
              <>
                <strong>Shal Su</strong> is a personal finance tracker for
                everyday money — record <strong>income</strong> and{" "}
                <strong>expenses</strong> in Myanmar Kyat (MMK), attach receipt
                photos, set monthly savings goals and category budgets, and see
                where your money goes through charts and a yearly overview. Your
                data is synced to your own account, so you can use it on your
                phone and computer. The app works in{" "}
                <strong>English and Burmese</strong> and follows a warm, simple,
                mobile-first design.
              </>
            }
            my="Shal Su သည် နေ့စဉ်အသုံးစရိတ်များအတွက် ပုဂ္ဂလိကဘဏ္ဍာစုစည်းမှုအက်ပ် ဖြစ်ပါသည် — မြန်မာကျပ် (MMK) ဖြင့် ဝင်ငွေနှင့် ထွက်ငွေများ မှတ်တမ်းတင်နိုင်ခြင်း၊ ပြေစာပုံများ တွဲဖက်နိုင်ခြင်း၊ လစဉ်စုဆောင်းငွေပန်းတိုင်နှင့် အမျိုးအစားဘတ်ဂျက်များ သတ်မှတ်နိုင်ခြင်း၊ ဇယားများနှင့် နှစ်ချုပ်မှတ်တမ်းဖြင့် ငွေသုံးစွဲမှုကို ခြေရာခံနိုင်ခြင်း တို့ ပါဝင်ပါသည်။ သင့်ဒေတာများကို သင့်အကောင့်ထဲတွင် သိမ်းဆည်းထားသဖြင့် ဖုန်းနှင့် ကွန်ပျူတာ နှစ်မျိုးလုံးတွင် အသုံးပြုနိုင်ပါသည်။"
          />
          <Bi
            en={
              <>
                This guide walks you through everything step by step — from
                creating your account to exporting a beautiful PDF report. Every
                section is written in <strong>English and Burmese</strong>.
              </>
            }
            my="ဤလမ်းညွှန်သည် အကောင့်ဖွင့်ခြင်းမှ PDFအစီရင်ခံစာထုတ်ယူခြင်းအထိ အဆင့်ဆင့် ရှင်းပြပါသည်။ အပိုင်းတိုင်းကို အင်္ဂလိပ်နှင့် မြန်မာ နှစ်မျိုးလုံးဖြင့် ရေးသားထားပါသည်။"
          />
          <Note>
            <strong>အသုံးဝင်သောအချက် · Tip:</strong>{" "}
            <span className="text-muted-foreground">
              စာမျက်နှာအပေါ်ဆုံးရှိ မာတိကာ (Contents) မှ လိုအပ်သောအပိုင်းကို
              တိုက်ရိုက်ခုန်နိုင်ပါသည်။
            </span>
          </Note>
        </Section>

        {/* 2 · Register */}
        <Section
          id="register"
          num={2}
          title="Create an account"
          subtitle="အကောင့်အသစ်ဖွင့်ခြင်း"
        >
          <Bi
            en={
              <>
                A free Shal Su account is required to save your data securely
                in the cloud. Registration takes less than a minute: you only
                need a <strong>name</strong>, an <strong>email address</strong>{" "}
                and a <strong>password</strong> (at least 6 characters).
              </>
            }
            my="Shal Su အကောင့်ဖြင့် သင့်ဒေတာများကို ကိုင်း(cloud)တွင် လုံခြုံစွာသိမ်းဆည်းနိုင်ပါသည်။ အကောင့်ဖွင့်ရန် အမည်၊ အီးမေးလ်နှင့် စကားဝှက် (အနည်းဆုံး စာလုံး ၆ လုံး) သာ လိုအပ်ပါသည်။"
          />
          <Sub en="Step-by-step" my="အဆင့်ဆင့်လုပ်ဆောင်နည်း" />
          <div className="flex flex-col gap-4">
            <Step n={1} title="Open the Shal Su website" titleMy="ဝဘ်ဆိုဒ်ဖွင့်ပါ">
              Open{" "}
              <a
                href="https://www.thantsin.website/"
                className="font-medium text-primary underline underline-offset-2"
              >
                https://www.thantsin.website/
              </a>{" "}
              in your browser. The sign-in page appears first.
              <br />
              ဘောက်စာ(browser)တွင် ဝဘ်ဆိုဒ်လိပ်စာကို ဖွင့်ပါ။ ပထမဆုံး အကောင့်ဝင်ရန်
              စာမျက်နှာ ပေါ်လာပါမည်။
            </Step>
            <Step
              n={2}
              title="Select Sign Up"
              titleMy="Sign Up ကိုနှိပ်ပါ"
            >
              On the sign-in page, tap <strong>Sign Up</strong> under the
              form to open the registration form.
              <br />
              စာမျက်နှာအောက်ခြေရှိ <strong>Sign Up</strong> ကို
              နှိပ်ပြီး အကောင့်ဖွင့်ရန် ဖောင်ကို ဖွင့်ပါ။
            </Step>
            <Step
              n={3}
              title="Fill in your details"
              titleMy="အချက်အလက်ဖြည့်ပါ"
            >
              <ul className="list-disc pl-5">
                <li>
                  <strong>Full Name</strong> — shown on your profile. ·{" "}
                  <span className="text-muted-foreground">
                    ကိုယ်ရေးအမည် — ပရိုဖိုင်တွင် ပြသပါမည်။
                  </span>
                </li>
                <li>
                  <strong>Email</strong> — used to sign in and to receive
                  password-reset links and account emails. Use an email you
                  can access later. ·{" "}
                  <span className="text-muted-foreground">
                    အီးမေးလ် — အကောင့်ဝင်ရန်နှင့် စကားဝှက်ပြန်ယူသည့်
                    လင့်ခ်များ လက်ခံရန် အသုံးပြုပါမည်။
                  </span>
                </li>
                <li>
                  <strong>Password</strong> — at least 6 characters. ·{" "}
                  <span className="text-muted-foreground">
                    စကားဝှက် — အနည်းဆုံး စာလုံး ၆ လုံး။
                  </span>
                </li>
                <li>
                  <strong>Confirm Password</strong> — type the same password
                  again. ·{" "}
                  <span className="text-muted-foreground">
                    စကားဝှက်အတည်ပြု — စကားဝှက်ကို ထပ်မံရိုက်ထည့်ပါ။
                  </span>
                </li>
              </ul>
            </Step>
            <Step
              n={4}
              title="Select Create Account"
              titleMy="Create Account ကိုနှိပ်ပါ"
            >
              Submit the form. If the information is valid, you are signed in
              and taken straight to your dashboard. A{" "}
              <strong>welcome email</strong> with your account summary is sent
              to your inbox.
              <br />
              ဖောင်ကို တင်သွင်းပါ။ အချက်အလက်မှန်ကန်ပါက အကောင့်ဝင်ပြီး
              Dashboard သို့ ရောက်ပါမည်။ ကြိုဆိုသည့်အီးမေးလ် သင့် inbox သို့
              ရောက်ရှိပါမည်။
            </Step>
          </div>
          <Note>
            <strong>အသုံးဝင်သောအချက် · Tip:</strong>{" "}
            <span className="text-muted-foreground">
              မှန်ကန်သောအီးမေးလ်ထည့်ပါ — စကားဝှက်မေ့ပါက ပြန်လည်သတ်မှတ်ရန်
              လင့်ခ်ကို ထိုအီးမေးလ်သို့သာ ပို့ပေးပါမည်။
            </span>
          </Note>
          <Warning>
            <strong>အရေးကြီး · Important:</strong> သင့်စကားဝှက်ကို
            အခြားသူများနှင့် မမျှဝေပါနှင့်။
            <span className="block text-muted-foreground">
              <strong>မြန်မာ:</strong> Password ကို မည်သူ့ကိုမျှ
              မပြောပြပါနှင့် — Shal Su အဖွဲ့လည်း သင့် Password ကို
              မတောင်းပါ။
            </span>
          </Warning>
        </Section>

        {/* 3 · Login */}
        <Section
          id="login"
          num={3}
          title="Sign in"
          subtitle="အကောင့်ဝင်ခြင်း"
        >
          <Bi
            en={
              <>
                Already registered? Enter your <strong>email</strong> and{" "}
                <strong>password</strong> on the sign-in page and select{" "}
                <strong>Sign In</strong>. Successful sign-in keeps you logged
                in on that device until you log out.
              </>
            }
            my="အကောင့်ဖွင့်ထားပြီးသားဖြစ်ပါက အီးမေးလ်နှင့်စကားဝှက် ထည့်ပြီး Sign In ကိုနှိပ်ပါ။ အောင်မြင်ပါက ထွက်မချင်အောင် ထိုဖုန်း/ကွန်ပျူတာတွင် အကောင့်ဝင်ထားနိုင်ပါသည်။"
          />
          <Note>
            <strong>Password မှားနေပါက:</strong>{" "}
            <span className="text-muted-foreground">
              Caps Lock ဖွင့်/ပိတ်နေခြင်းနှင့် Keyboard ဘာသာစကား
              (English) မှန်/မမှန် ပြန်စစ်ပါ။ အကြိမ်များစွာ မှားပါက "Invalid email
              or password" စာသား ပေါ်လာပါမည်။
            </span>
          </Note>
          <Bi
            en={
              <>
                Can't remember your password? Select{" "}
                <strong>Forgot password?</strong> under the password field —
                see the next section.
              </>
            }
            my="စကားဝှက်မေ့နေပါက စကားဝှက်အောက်ရှိ <strong>Forgot password?</strong> ကို နှိပ်ပါ။"
          />
        </Section>

        {/* 4 · Password recovery */}
        <Section
          id="password"
          num={4}
          title="Password recovery & change"
          subtitle="စကားဝှက်ပြန်ယူခြင်းနှင့်ပြောင်းလဲခြင်း"
        >
          <Sub en="If you forgot your password" my="စကားဝှက်မေ့သွားပါက" />
          <div className="flex flex-col gap-4">
            <Step n={1} title="Select Forgot password?" titleMy="Forgot password? ကိုနှိပ်ပါ">
              On the sign-in page, under the password field.
              <br />
              အကောင့်ဝင်ရန်စာမျက်နှာတွင် စကားဝှက်အောက်၌ နှိပ်ပါ။
            </Step>
            <Step n={2} title="Enter your account email" titleMy="အီးမေးလ်ထည့်ပါ">
              Type the email you registered with and select{" "}
              <strong>Send reset link</strong>.
              <br />
              အကောင့်ဖွင့်ထားသောအီးမေးလ်ထည့်ပြီး <strong>Send reset link</strong>{" "}
              ကိုနှိပ်ပါ။
            </Step>
            <Step n={3} title="Check your inbox" titleMy="Inbox စစ်ပါ">
              If an account exists for that email, a{" "}
              <strong>Reset your Shal Su password</strong> email arrives with a
              button link. Also check the <strong>spam/junk</strong> folder.
              <br />
              ထိုအီးမေးလ်ဖြင့်အကောင့်ရှိပါက ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ပါသော
              အီးမေးလ် ရောက်ပါမည်။ Spam folder ကိုလည်း စစ်ဆေးပါ။
            </Step>
            <Step n={4} title="Open the link and set a new password" titleMy="လင့်ခ်ဖွင့်ပြီးစကားဝှက်အသစ်သတ်မှတ်ပါ">
              The link is valid for <strong>1 hour</strong>. It opens the reset
              page — enter your new password twice and confirm. You are then
              taken to the sign-in page.
              <br />
              လင့်ခ်သက်တမ်းမှာ <strong>၁ နာရီ</strong> ဖြစ်ပါသည်။ စကားဝှက်အသစ်ကို
              နှစ်ကြိမ်ထည့်ပြီး အတည်ပြုပါ။
            </Step>
            <Step n={5} title="Sign in with the new password" titleMy="စကားဝှက်အသစ်ဖြင့်ဝင်ပါ">
              Use the new password from now on. A{" "}
              <strong>password changed</strong> confirmation email is also sent
              for your safety.
              <br />
              နောက်ပိုင်း စကားဝှက်အသစ်ဖြင့်သာ အသုံးပြုပါ။ လုံခြုံရေးအတွက်
              ပြောင်းလဲကြောင်း အီးမေးလ်လည်း ရောက်ပါမည်။
            </Step>
          </div>
          <Sub en="Change your password (you know the current one)" my="စကားဝှက်ပြောင်းလဲခြင်း" />
          <Bi
            en={
              <>
                Go to <strong>Settings → Account → Change Password</strong>.
                Enter your current password, the new password, and confirm.
                Saving requires your current password so only you can change it.
              </>
            }
            my="Settings → Account → Change Password သို့သွားပါ။ လက်ရှိစကားဝှက်၊ စကားဝှက်အသစ်နှင့် အတည်ပြုကွက် ဖြည့်ပြီး သိမ်းပါ။"
          />
          <Note>
            <strong>မရရှိပါက:</strong>{" "}
            <span className="text-muted-foreground">
              Reset အီးမေးလ် မရရှိပါက spam folder စစ်ပါ၊ မှန်ကန်သောအီးမေးလ်
              ဟုတ်/မဟုတ် ပြန်စစ်ပါ၊ ပြီးလျှင် ထပ်မံတောင်းဆိုပါ။ လင့်ခ်သက်တမ်း
              ကုန်သွားပါက အသစ်တောင်းဆိုရပါမည်။
            </span>
          </Note>
        </Section>

        {/* 5 · Dashboard */}
        <Section
          id="dashboard"
          num={5}
          title="Dashboard tour"
          subtitle="ပင်မစာမျက်နှာ လျှောက်ကြည့်နည်း"
        >
          <Bi
            en={
              <>
                The dashboard summarizes the month you are viewing. At the top
                is the <strong>month navigator</strong> — arrows move between
                months and <strong>Today</strong> jumps back to the current
                month. Everything below (stats, charts, budgets, lists) follows
                the selected month.
              </>
            }
            my="Dashboard သည် သင်ကြည့်နေသောလအတွက် အနှစ်ချုပ် ပြသပါသည်။ အပေါ်တွင် လရွေးချယ်ကိရိယာရှိပြီး မြှားများဖြင့် လပြောင်းနိုင်သည်။ Today ဖြင့် လက်ရှိလသို့ ပြန်သွားနိုင်သည်။"
          />
          <GuideTable
            head={["Widget", "ဘာပြသလဲ / What it shows"]}
            rows={[
              [
                <>
                  <strong>Stat cards</strong>
                </>,
                <>
                  Total <strong>Income</strong> (green), total{" "}
                  <strong>Expense</strong> (red), and <strong>Net</strong> for
                  the month. · ထိုလအတွက် ဝင်ငွေ၊ ထွက်ငွေနှင့် ကျန်ငွေ။
                </>,
              ],
              [
                <>
                  <strong>Category breakdown</strong>
                </>,
                <>
                  A pie chart of spending by category so you can see the
                  biggest areas at a glance. · အမျိုးအစားအလိုက် ထွက်ငွေပုံချိုး။
                </>,
              ],
              [
                <>
                  <strong>Savings goal</strong>
                </>,
                <>
                  Your monthly target, progress bar, days left, and a
                  celebration when the goal is met. · စုဆောင်းငွေပန်းတိုင်နှင့်
                  တိုးတက်မှုအခြေအနေ။
                </>,
              ],
              [
                <>
                  <strong>Category budgets</strong>
                </>,
                <>
                  Spent vs limit per category, with warnings when approaching
                  or exceeding the limit. · ဘတ်ဂျက်ကန့်သတ်ချက်နှင့် သုံးစွဲမှု။
                </>,
              ],
              [
                <>
                  <strong>Recent transactions</strong>
                </>,
                <>
                  The latest entries for the month with an 📎 mark when a
                  receipt is attached. · လက်ရှိလ၏ နောက်ဆုံးမှတ်တမ်းများ။
                </>,
              ],
            ]}
          />
        </Section>

        {/* 6 · Transactions */}
        <Section
          id="transactions"
          num={6}
          title="Add income & expense"
          subtitle="ဝင်ငွေနှင့်ထွက်ငွေ မှတ်တမ်းတင်ခြင်း"
        >
          <Bi
            en={
              <>
                Tap the gold <strong>+</strong> button (mobile, bottom center)
                or <strong>Add transaction</strong> (desktop) to open the
                entry dialog.
              </>
            }
            my="အောင်ရောင် <strong>+</strong> ခလုတ် (မိုဘိုင်းအောက်ခြေ) သို့မဟုတ် Add
            transaction ကို နှိပ်ပြီး ဖောင်ဖွင့်ပါ။"
          />
          <Sub en="Dialog fields" my="ဖောင်ပါအကွက်များ" />
          <GuideTable
            head={["Field", "ရှင်းလင်းချက်"]}
            rows={[
              [
                <strong>Type</strong>,
                <>
                  Switch between <strong>Income</strong> and{" "}
                  <strong>Expense</strong>. · ဝင်ငွေ/ထွက်ငွေ ရွေးချယ်ပါ။
                </>,
              ],
              [
                <strong>Amount</strong>,
                <>
                  Numbers only, in the selected currency (MMK by default).
                  · ဂဏန်းထည့်ပါ (MMK စတင်)။
                </>,
              ],
              [
                <strong>Category</strong>,
                <>
                  9 income categories (Salary, Freelance, Business, Gift,
                  Bonus, Rental, Interest, Refund, Other) and 17 expense
                  categories (Food, Transport, Shopping, Bills, Health,
                  Education, Entertainment, Phone & Internet, Housing, Family,
                  Travel, Clothing, Beauty, Pets, Charity, Investment, Other).
                  · ဝင်ငွေ ၉ မျိုး၊ ထွက်ငွေ ၁၇ မျိုး။
                </>,
              ],
              [
                <strong>Note</strong>,
                <>
                  Free text — e.g. "Mohinga & tea shop". Searchable later. ·
                  စိတ်ကြိုက်မှတ်စု။
                </>,
              ],
              [
                <strong>Date</strong>,
                <>
                  Defaults to today; pick any date for back-dating entries. ·
                  နေ့စွဲရွေးချယ်နိုင်သည်။
                </>,
              ],
              [
                <strong>Recurring</strong>,
                <>
                  Optional — Weekly, Bi-weekly, Monthly or Yearly (see
                  section 10). · ထပ်တလဲလဲ ရွေးချယ်နိုင်သည်။
                </>,
              ],
              [
                <strong>Receipt photo</strong>,
                <>
                  Optional image attachment (see section 8). · ပြေစာပုံ
                  တွဲနိုင်သည်။
                </>,
              ],
            ]}
          />
          <Sub en="Edit or delete an entry" my="ပြင်ဆင်ခြင်း/ဖျက်ခြင်း" />
          <Bi
            en={
              <>
                Tap any transaction in the list to reopen it with all details.
                Change what you need and <strong>Save</strong>, or use{" "}
                <strong>Delete</strong> (with confirmation) to remove it
                permanently.
              </>
            }
            my="စာရင်းပါ မှတ်တမ်းကို နှိပ်ပြီး ပြင်ဆင်-သိမ်းနိုင်သည်။ Delete
            (အတည်ပြုချက်ဖြင့်) ဖြင့် အပြီးဖျက်နိုင်သည်။"
          />
        </Section>

        {/* 7 · Income gate */}
        <Section
          id="gate"
          num={7}
          title="The income-first rule"
          subtitle="ဝင်ငွေအရင်ထည့်ရန် လိုအပ်ခြင်း"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="size-4 text-primary" />
            </span>
            <Bi
              en={
                <>
                  Shal Su encourages healthy tracking:{" "}
                  <strong>
                    expenses stay locked until you record your first income
                  </strong>
                  . The save button explains the rule, and the dialog opens on
                  the Income type automatically. Once your first income entry
                  exists, expense tracking is unlocked for good.
                </>
              }
              my="Shal Su တွင် <strong>ဝင်ငွေ မထည့်မီ ထွက်ငွေ သိမ်း၍မရပါ</strong> —
              ပထမဆုံးဝင်ငွေ မှတ်တမ်းတင်ပြီးမှ ထွက်ငွေထည့်ခွင့် ဖွင့်ပေးပါသည်။
              ဖောင်ကိုလည်း ဝင်ငွေအမျိုးအစားဖြင့် အလိုအလျောက်ဖွင့်ပေးပါသည်။"
            />
          </div>
          <Note>
            <strong>မည်သို့ဖြေရှင်းရမလဲ:</strong>{" "}
            <span className="text-muted-foreground">
              + ခလုတ်နှိပ် → Type ကို Income ရွေး → ပထမဆုံးဝင်ငွေ (ဥပမာ
              လစာ) ထည့်သိမ်းပါ။ ထို့နောက် ထွက်ငွေအားလုံး ထည့်နိုင်ပါပြီ။
            </span>
          </Note>
        </Section>

        {/* 8 · Receipts */}
        <Section
          id="receipts"
          num={8}
          title="Receipt photos"
          subtitle="ပြေစာပုံများ"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="size-4 text-primary" />
            </span>
            <Bi
              en={
                <>
                  Attach a photo of a paper receipt or screenshot to any entry
                  as proof of payment. In the dialog, select{" "}
                  <strong>Add receipt photo</strong> and choose{" "}
                  <strong>camera or gallery</strong>. Accepted formats: JPEG,
                  PNG and WebP; the original must be under 10&nbsp;MB — Shal
                  Su compresses it on your device (kept around 400&nbsp;KB)
                  before saving, so uploads stay fast on mobile data.
                </>
              }
              my="မှတ်တမ်းတိုင်းတွင် ပြေစာပုံ (JPEG/PNG/WebP, 10MB အောက်) တွဲနိုင်ပါသည်။
              ဖုန်းထဲရှိ ဖိုင်ကို အရွယ်အစားလျှော့ပြီးမှ သိမ်းပါသဖြင့် mobile data
              သုံးစွဲမှု နည်းပါသည်။"
            />
          </div>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed">
            <li>
              Entries with a receipt show an <strong>📎</strong> mark in lists. ·{" "}
              <span className="text-muted-foreground">
                ပြေစာပါသောမှတ်တမ်းတွင် 📎 အမှတ်အသား ပေါ်ပါသည်။
              </span>
            </li>
            <li>
              Reopen the entry to <strong>view</strong>,{" "}
              <strong>replace</strong> or <strong>remove</strong> the photo. ·{" "}
              <span className="text-muted-foreground">
                ဖောင်ပြန်ဖွင့်ပြီး ကြည့်/လဲ/ဖျက် နိုင်သည်။
              </span>
            </li>
            <li>
              Receipts stay attached to that entry on every device you sign in
              to. ·{" "}
              <span className="text-muted-foreground">
                အခြားစက်တွင်လည်း ပြေစာပုံ ပါဝင်ပါသည်။
              </span>
            </li>
          </ul>
          <Note>
            <strong>ပုံမထည့်နိုင်ပါက:</strong>{" "}
            <span className="text-muted-foreground">
              ဖိုင်အမျိုးအစား (JPEG/PNG/WebP) နှင့် အရွယ်အစား (10MB အောက်)
              စစ်ပါ။ Screen recording များကဲ့သို့ ကြီးသောဖိုင်များ ရိုက်ကူးပြီး
              ထည့်ကြည့်ပါ။
            </span>
          </Note>
        </Section>

        {/* 9 · Goals & budgets */}
        <Section
          id="goals"
          num={9}
          title="Savings goal & category budgets"
          subtitle="စုဆောင်းငွေပန်းတိုင်နှင့် အမျိုးအစားဘတ်ဂျက်"
        >
          <Sub en="Savings goal" my="စုဆောင်းငွေပန်းတိုင်" />
          <Bi
            en={
              <>
                Set a <strong>Target Amount</strong> and optional{" "}
                <strong>Deadline</strong> for the month. The progress bar
                tracks how close you are, showing days left; when you reach
                the target the card celebrates the met goal.
              </>
            }
            my=" လအတွက် ပန်းတိုင်ပမာဏနှင့် သက်တမ်း (ရွေးချယ်နိုင်) သတ်မှတ်ပါ။
            တိုးတက်မှုဘားဖြင့် ကျန်ရက်များ ပြသပြီး ပန်းတိုင်ရောက်ပါက ဂုဏ်ပြု
            ပြသပါသည်။"
            />
          <Sub en="Category budgets" my="အမျိုးအစားဘတ်ဂျက်" />
          <Bi
            en={
              <>
                Give a category (e.g. Food) a monthly <strong>limit</strong>.
                Shal Su shows spent vs remaining, an{" "}
                <strong>"Approaching limit"</strong> warning near the edge and{" "}
                <strong>"Budget exceeded"</strong> once you pass it. Remove a
                budget anytime.
              </>
            }
            my="အမျိုးအစားတစ်ခုအတွက် လစဉ်ကန့်သတ်ငွေ သတ်မှတ်ပါ။ သုံးစွဲပြီး/ကျန်ငွေ
            ပြသပြီး နီးလာပါက သတိပေး၊ ကျော်လွန်ပါက Budget exceeded ပြပါသည်။"
            />
        </Section>

        {/* 10 · Recurring */}
        <Section
          id="recurring"
          num={10}
          title="Recurring entries"
          subtitle="ထပ်တလဲလဲ မှတ်တမ်းများ"
        >
          <Bi
            en={
              <>
                Rent, salary and subscriptions repeat — mark an entry as{" "}
                <strong>Recurring</strong> when saving it and choose a
                frequency: <strong>Weekly</strong>,{" "}
                <strong>Bi-weekly</strong>, <strong>Monthly</strong> or{" "}
                <strong>Yearly</strong>. Shal Su prepares the following
                occurrences automatically so you don't re-type them each period.
                Recurring entries respect the same income-first rule as normal
                expenses.
              </>
            }
            my="လစာ၊ ငှားရမ်းခ စသည်များကို သိမ်းဆည်းစဉ် Recurring ရွေးပြီး Weekly /
            Bi-weekly / Monthly / Yearly ထဲမှ ရွေးပါ။ နောက်လအတွက် အလိုအလျောက်
            ပြင်ဆင်-သိမ်းပေးပါသည်။"
          />
        </Section>

        {/* 11 · History & Yearly */}
        <Section
          id="history"
          num={11}
          title="History & Yearly overview"
          subtitle="မှတ်တမ်းနှင့် နှစ်ချုပ်ခြမ်းချုပ်"
        >
          <Sub en="History" my="မှတ်တမ်း" />
          <Bi
            en={
              <>
                The <strong>History</strong> tab lists any month's entries
                with a month selector. Use the <strong>search box</strong> to
                find entries by note or category name quickly.
              </>
            }
            my="History တွင် လရွေးချယ်ပြီး ထိုလ၏ မှတ်တမ်းအားလုံး ကြည့်နိုင်သည်။
            Search ဖြင့် မှတ်စု/အမျိုးအစားအလိုက် ရှာနိုင်သည်။"
          />
          <Sub en="Yearly overview" my="နှစ်ချုပ်" />
          <Bi
            en={
              <>
                The <strong>Yearly</strong> tab shows a month-by-month income
                vs expense bar chart for the whole year plus the top spending
                categories — useful for annual review and planning.
              </>
            }
            my="Yearly တွင် တစ်နှစ်လုံး၏ လအလိုက် ဝင်ငွေ/ထွက်ငွေဇယားနှင့်
            အများဆုံးသုံးသောအမျိုးအစားများ ပြသပါသည်။"
          />
        </Section>

        {/* 12 · Settings */}
        <Section
          id="settings"
          num={12}
          title="Settings"
          subtitle="ဆက်တင်များ"
        >
          <Bi
            en={
              <>
                Open <strong>Settings</strong> from the navigation to manage
                your account and preferences.
              </>
            }
            my="Navigation မှ Settings သို့ဝင်ပြီး အကောင့်နှင့် နှစ်သက်ရာ
            ဆက်တင်များ စီမံနိုင်ပါသည်။"
          />
          <GuideTable
            head={["Section", "ဘာလုပ်နိုင်လဲ"]}
            rows={[
              [
                <strong>Account</strong>,
                <>
                  Update your <strong>name</strong>, upload a{" "}
                  <strong>profile photo</strong>, change your{" "}
                  <strong>email</strong> (applies immediately), change your{" "}
                  <strong>password</strong>, or <strong>log out</strong>. ·
                  အမည်/ပုံ/အီးမေးလ်/စကားဝှက် ပြင်ဆင်ခြင်း၊ ထွက်ခြင်း။
                </>,
              ],
              [
                <strong>Appearance</strong>,
                <>
                  <strong>Light</strong>, <strong>Dark</strong> or{" "}
                  <strong>System</strong> theme. · Light / Dark / System
                  အသွင်အပြင်ရွေးချယ်နိုင်သည်။
                </>,
              ],
              [
                <strong>Currency</strong>,
                <>
                  Display currency symbol — MMK (default), USD, THB, JPY or
                  EUR. · ငွေကိုယ်စားပြုသင်္ကေတ ရွေးနိုင်သည်။
                </>,
              ],
              [
                <strong>Privacy</strong>,
                <>
                  Toggles: <strong>Show Balances</strong>,{" "}
                  <strong>Show Transactions</strong>,{" "}
                  <strong>Hide Amounts in Charts</strong>,{" "}
                  <strong>Mask Sensitive Data</strong> — hide numbers when
                  someone is looking over your shoulder. · ခရီးသွား/လူရှေ့တွင်
                  ငွေပမာဏ ဝှက်ထားနိုင်သည်။
                </>,
              ],
              [
                <strong>Data & Export</strong>,
                <>
                  <strong>Export as CSV</strong> — all transactions for
                  spreadsheets. <strong>Export as PDF</strong> — a designed A4
                  report with summary cards and a color table.{" "}
                  <strong>Clear All Data</strong> — permanently deletes
                  everything (be careful). · CSV နှင့် PDF ထုတ်ယူခြင်း၊
                  ဒေတာဖျက်ခြင်း။
                </>,
              ],
            ]}
          />
          <Note>
            <strong>PDF Report:</strong>{" "}
            <span className="text-muted-foreground">
              Gold header with the Shal Su logo, income/expense/net cards, and
              a striped table with colored amounts — ready to share or print. ·
              Logo ပါသော အစီရင်ခံစာ PDF ကို မျှဝေ-ပုံနှိပ်နိုင်ပါသည်။
            </span>
          </Note>
        </Section>

        {/* 13 · Shortcuts */}
        <Section
          id="shortcuts"
          num={13}
          title="Keyboard shortcuts"
          subtitle="ကီးဘုတ်ဖောင်းဒါများ"
        >
          <Bi
            en="On a computer, these keys speed you up:"
            my="ကွန်ပျူတာသုံးပါက အောက်ပါဖောင်းဒါများ အသုံးဝင်ပါသည် —"
          />
          <GuideTable
            head={["Key", "Action"]}
            rows={[
              [<strong>N</strong>, <>Open the add-transaction dialog · မှတ်တမ်းအသစ်ဖွင့်</>],
              [<strong>/</strong>, <>Focus search · ရှာဖွေရန်</>],
              [<strong>?</strong>, <>Open help · အကူအညီ</>],
              [<strong>Esc</strong>, <>Close dialog · ဖောင်ပိတ်</>],
            ]}
          />
        </Section>

        {/* 14 · Mobile */}
        <Section
          id="mobile"
          num={14}
          title="Using Shal Su on mobile"
          subtitle="မိုဘိုင်းဖုန်းဖြင့်အသုံးပြုခြင်း"
        >
          <Bi
            en={
              <>
                Shal Su is designed phone-first. A floating{" "}
                <strong>bottom navigation</strong> gives you{" "}
                <strong>Home</strong>, <strong>History</strong>, the gold{" "}
                <strong>+</strong> add button in the middle,{" "}
                <strong>Yearly</strong> and <strong>Settings</strong>. The
                layout adapts to small screens, respects notches (safe-area),
                and every dialog is thumb-friendly.
              </>
            }
            my="Shal Su ကို ဖုန်ဦးစားပေး ဒီဇိုင်းဆွဲထားပါသည်။ အောက်ခြေ menu တွင် Home /
            History / + (ထည့်ရန်) / Yearly / Settings ရှိပြီး ဖုန်းအရွယ်အစားအလိုက်
            အလိုအလျောက် ပြင်ဆင်ပေးပါသည်။"
          />
        </Section>

        {/* 15 · Glossary */}
        <Section
          id="terms"
          num={15}
          title="Glossary"
          subtitle="ဝေါဟာရများ"
        >
          <GuideTable
            head={["English", "မြန်မာလို"]}
            rows={[
              ["Sign in / Login", "အကောင့်ဝင်ရန်"],
              ["Sign up / Register", "အကောင့်အသစ်ဖွင့်ရန်"],
              ["Dashboard", "ပင်မစာမျက်နှာ / အနှစ်ချုပ်"],
              ["Transaction", "ငွေစာရင်း / မှတ်တမ်း"],
              ["Income", "ဝင်ငွေ"],
              ["Expense", "ထွက်ငွေ / အသုံးစရိတ်"],
              ["Category", "အမျိုးအစား"],
              ["Note", "မှတ်စု"],
              ["Recurring", "ထပ်တလဲလဲ"],
              ["Savings Goal", "စုဆောင်းငွေပန်းတိုင်"],
              ["Budget Limit", "ဘတ်ဂျက်ကန့်သတ်ငွေ"],
              ["Receipt", "ပြေစာ"],
              ["Export", "ထုတ်ယူရန်"],
              ["Settings", "ဆက်တင်များ"],
              ["Privacy", "ကိုယ်ရေးလုံခြုံရေး"],
              ["Currency", "ငွေကိုယ်စားပြုငွေ"],
              ["Delete", "ဖျက်ရန်"],
              ["Save", "သိမ်းဆည်းရန်"],
            ]}
          />
        </Section>

        {/* 16 · Troubleshooting */}
        <Section
          id="troubleshooting"
          num={16}
          title="Troubleshooting"
          subtitle="အဖြစ်များသောပြဿနာများနှင့်ဖြေရှင်းနည်း"
        >
          <GuideTable
            head={["Problem · ပြဿနာ", "What to do · ဖြေရှင်းနည်း"]}
            rows={[
              [
                <>Cannot sign in · အကောင့်မဝင်နိုင်</>,
                <>
                  Re-check email and password; watch Caps Lock and keyboard
                  language. Use <strong>Forgot password?</strong> if needed.
                  · အီးမေးလ်/စကားဝှက် ပြန်စစ်ပါ။
                </>,
              ],
              [
                <>No reset email · Reset အီးမေးလ်မရပါ</>,
                <>
                  Check <strong>spam/junk</strong>, confirm the address is the
                  one you registered, wait a minute, then request again. ·
                  Spam folder စစ်ပြီး ထပ်တောင်းဆိုပါ။
                </>,
              ],
              [
                <>Expense save is locked · ထွက်ငွေသိမ်း၍မရ</>,
                <>
                  You have not recorded any income yet — add your first income
                  entry; expenses unlock afterwards. · ပထမဆုံးဝင်ငွေ ထည့်ပါ။
                </>,
              ],
              [
                <>Receipt will not attach · ပြေစာပုံမထည့်နိုင်</>,
                <>
                  Use JPEG/PNG/WebP under 10&nbsp;MB. Try a smaller or clearer
                  photo. · ဖိုင်အမျိုးအစားနှင့်အရွယ် စစ်ပါ။
                </>,
              ],
              [
                <>Page will not load · စာမျက်နှာမတက်</>,
                <>
                  Refresh, check internet, try again in a moment or switch
                  browser/network. · Refresh လုပ်ပြီး Internet စစ်ပါ။
                </>,
              ],
              [
                <>Kicked out / session expired · ပြန်လည်ဝင်ရန်လို</>,
                <>
                  For your security you are signed out after a while — sign in
                  again; your data is safe in your account. · လုံခြုံရေးအရ
                  ပြန်ဝင်ပါ။ ဒေတာများ မပျောက်ပါ။
                </>,
              ],
              [
                <>Export missing · ထုတ်ယူ၍မရ</>,
                <>
                  Allow downloads/pop-ups for the site and check your
                  browser's Downloads folder. · Download ခွင့်ပြုထား/မထား စစ်ပါ။
                </>,
              ],
              [
                <>Still stuck · ဆက်လက်အဆင်မပြေ</>,
                <>
                  Take a <strong>screenshot</strong> of the error before
                  closing it, then retry later. · Error ကို Screenshot
                  ရိုက်ထားပြီး နောက်မှ ထပ်စမ်းပါ။
                </>,
              ],
            ]}
          />
        </Section>

        {/* 17 · Security */}
        <Section
          id="security"
          num={17}
          title="Security & your data"
          subtitle="လုံခြုံရေးနှင့် သင့်ဒေတာ"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="size-4 text-primary" />
            </span>
            <div className="flex flex-col gap-3 text-sm leading-relaxed">
              <p>
                Your entries are stored in a secure database and only appear
                in your own signed-in account. ·{" "}
                <span className="text-muted-foreground">
                  သင့်ဒေတာများကို လုံခြုံသော database တွင်သာ သိမ်းဆည်းပြီး
                  သင့်အကောင့်ထဲတွင်သာ မြင်နိုင်ပါသည်။
                </span>
              </p>
              <ul className="list-disc pl-5">
                <li>
                  Never share your password. Shal Su staff will never ask for
                  it. ·{" "}
                  <span className="text-muted-foreground">
                    Password ကို ဘယ်သူ့ကိုမျှ မပေးပါနှင့်။
                  </span>
                </li>
                <li>
                  On shared phones/computers, always{" "}
                  <strong>log out</strong> (Settings → Account → Log out). ·{" "}
                  <span className="text-muted-foreground">
                    အများသုံးစက်တွင် Logout ပြုလုပ်ပါ။
                  </span>
                </li>
                <li>
                  The <strong>welcome</strong>,{" "}
                  <strong>password reset</strong> and{" "}
                  <strong>password changed</strong> emails help you notice
                  account activity you didn't do — if one arrives
                  unexpectedly, change your password immediately. ·{" "}
                  <span className="text-muted-foreground">
                    မမျှော်လင့်သောအီးမေးလ်ရောက်ပါက ချက်ချင်း
                    Password ပြောင်းပါ။
                  </span>
                </li>
              </ul>
              <div className="flex items-start gap-2 rounded-xl bg-secondary/50 px-3.5 py-2.5">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-muted-foreground">
                  <strong>Clear All Data</strong> (Settings → Data & Export)
                  cannot be undone — export a CSV/PDF copy first if you might
                  need it. ·{" "}
                  <span>
                    ဒေတာအားလုံးဖျက်ပါက ပြန်ရန်မလွယ် — မလိုအပ်မီ CSV/PDF
                    ထုတ်ထားပါ။
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Closing tips */}
        <Card className="gradient-gold border-0 text-white">
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <Sparkles className="size-5" />
            <p className="text-base font-bold">You're ready · အဆင်သင့်ပါပြီ</p>
            <p className="text-sm text-white/85">
              Record today's first transaction — income unlocks everything
              else. · ဒီနေ့ပထမဆုံးမှတ်တမ်းကို ယနေ့လုပ်ပါ။
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-1">
              <Link to="/">
                Open Shal Su
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          <Megaphone className="size-3.5" />
          Shal Su User Guide · အသုံးပြုသူလမ်းညွှန်
        </p>
        <p className="mt-1 flex items-center justify-center gap-1">
          <ExternalLink className="size-3" />
          www.thantsin.website
        </p>
        <p className="mt-3">
          <Link to="/user-guide" className="text-primary hover:underline">
            ↑ Back to top
          </Link>
        </p>
      </footer>
    </div>
  );
}
