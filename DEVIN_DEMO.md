# Devin lab: Run a check every morning with an automation

**What it shows:** You create a Devin [Automation](https://docs.devin.ai/product-guides/automations) with a schedule trigger. Every morning it starts a Devin session that checks this repo for outdated packages and failing tests. It opens a pull request only when something needs fixing.

**Needs:** A GitHub account and a Devin account. No Slack. You only use your browser.

Full workshop: [devinworkshop.dev](https://devinworkshop.dev)

## The problem in this repo

Nobody has touched this repo for a while, and two things have gone wrong on their own:

- **Tests fail.** 4 of 10 tests fail with `date is in the past`. They book a desk on a fixed date, `2026-09-15`, and that date has now passed.
- **Packages are old.** `express`, `dayjs` and `supertest` are behind. `npm audit` reports 7 advisories (3 high) in packages that Express pulls in.

This is what the checks print today:

```text
$ npm test
not ok 2 - POST /api/bookings then GET /api/desks shows one fewer free desk
not ok 5 - books a free desk
not ok 6 - a desk can only be booked once per day
not ok 7 - a person can only hold one desk per day
# pass 6
# fail 4

$ npm outdated
Package    Current   Wanted   Latest
dayjs      1.11.10  1.11.23  1.11.23
express     4.19.2   4.22.3    5.3.0
supertest    7.0.0    7.3.1    7.3.1

$ npm audit --omit=dev
7 vulnerabilities (3 low, 1 moderate, 3 high)
```

(The newest version numbers and the advisory count may be higher when you run it. That is fine.)

## Set it up

1. Click **Use this template → Create a new repository**, choose your GitHub account as the owner, keep the name `devin-demo-morning-automation`, and click **Create repository**. Use the template, not a fork: pull requests on a fork go to the original repo.
2. In Devin, open [**Settings → Connections → GitHub**](https://app.devin.ai/settings/connections/github) and make sure Devin can access the new repo.
3. Optional: see the problem yourself. In your new repo on GitHub, click the **Actions** tab, click **Checks** on the left, click **Run workflow**, then the green **Run workflow** button. After about a minute the run has a red X. Click it and open the **Tests** step to see the 4 failing tests.

## Create the automation

1. Open [app.devin.ai](https://app.devin.ai) and click **Automations** in the sidebar.
2. Click **Create automation** and choose **Create**. If you have no automations yet, click **Create manually** instead.
3. If there is a name box, call it `Morning check`.
4. In the trigger dropdown, expand **Schedule** and choose **Every day**. Set the time to a morning hour, like 8:00 AM. The time zone is your browser's time zone; you can change it in the schedule editor.
5. For the action, choose **Start session**.
6. Paste the prompt below into the **Prompt** box. Replace `<you>` with your GitHub user.
7. Optional: set an **ACU limit**, like 10, so one run can't use too many credits.
8. Click **Create automation**.
9. You don't have to wait until morning. On the automation's page, click **Run now**. Open the **Activity** tab and click the link to the session it started.

## Prompt

```text
Morning check for https://github.com/<you>/devin-demo-morning-automation

1. Run `npm ci`, then `npm test`, `npm outdated` and `npm audit --omit=dev`. Keep the output of each.

2. Something needs fixing if any test fails, if `npm outdated` shows a package whose Current version is lower than its Wanted version, or if `npm audit` reports an advisory that can be fixed without a major version upgrade.

3. If nothing needs fixing, stop. Do not open a pull request, branch or issue. End with one line: "All clear", the number of passing tests, and the major upgrades that are available.

4. If something needs fixing:
   - First look for an open pull request whose title starts with "Morning check:". If there is one, push your fix to it instead of opening a new one.
   - Update packages only within the version ranges in package.json. Do not do major upgrades.
   - Fix each failing test at its cause. If the code is wrong, fix the code. If the test is wrong, fix the test. Do not delete or skip tests.
   - Run `npm test` and `npm audit --omit=dev` again. Both must pass before you open the pull request.

5. Title the pull request "Morning check: <short summary>". In the description, list what was wrong (paste the failing lines), what you changed and why, the test and audit results before and after, and any major upgrades you did not do.
```

## What to look for

- The session runs the checks and reads the failing output before it changes anything.
- It updates packages within their ranges and lists major upgrades (like Express 5) in the pull request without doing them.
- The pull request gets a green check from the **Checks** workflow.

## When it's done

- There is one pull request titled `Morning check: …` with all tests passing and `found 0 vulnerabilities` from `npm audit --omit=dev`.
- Merge it, then click **Run now** again. This time the session ends with "All clear" and opens no pull request.
- To stop the daily runs, turn the automation off with its toggle on the **Automations** page.
