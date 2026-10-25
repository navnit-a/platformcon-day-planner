import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 393, height: 852 },
  { width: 1440, height: 900 },
];
const THEMES = ["light", "dark"] as const;
const PHONE_WIDTH = 393;
const MIN_TARGET = 44;
const SHOTS = "test-results/layout";

async function open(page: Page, theme: string) {
  await page.addInitScript((value) => {
    localStorage.setItem("day-planner-theme", value);
  }, theme);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

async function expectNoSidewaysScroll(page: Page) {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
}

async function shoot(page: Page, view: string, width: number, theme: string) {
  await page.screenshot({ path: `${SHOTS}/${view}-${width}-${theme}.png`, fullPage: true });
}

async function smallTargets(page: Page, min: number) {
  return page.evaluate((size) => {
    return [...document.querySelectorAll<HTMLElement>("button, a")]
      .filter((el) => el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && box.height > 0)
      .filter(({ box }) => box.width < size || box.height < size)
      .map(({ el, box }) => {
        const label = el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 40);
        return `${el.tagName.toLowerCase()} "${label}" ${Math.round(box.width)}x${Math.round(box.height)}`;
      });
  }, min);
}

async function tabToFirstButton(page: Page) {
  const first = page.locator("button").first();
  for (let presses = 0; presses < 20; presses += 1) {
    await page.keyboard.press("Tab");
    if (await first.evaluate((el) => el === document.activeElement)) return first;
  }
  throw new Error("the first button never took keyboard focus");
}

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test.describe(`${viewport.width}px ${theme}`, () => {
      test.use({ viewport });

      test("schedule has no sideways scroll", async ({ page }) => {
        await open(page, theme);
        await expectNoSidewaysScroll(page);
        await shoot(page, "schedule", viewport.width, theme);
      });

      test("rooms has no sideways scroll", async ({ page }) => {
        await open(page, theme);
        const rooms = page.getByRole("button", { name: "Rooms", exact: true });
        test.skip((await rooms.count()) === 0, "no Rooms button");
        await rooms.first().click();
        await expectNoSidewaysScroll(page);
        await shoot(page, "rooms", viewport.width, theme);
      });

      test("first track filter has no sideways scroll", async ({ page }) => {
        await open(page, theme);
        const filter = page.getByRole("group", { name: "Filter by track" }).getByRole("button");
        await filter.first().click();
        await expect(filter.first()).toHaveAttribute("aria-pressed", "true");
        await expectNoSidewaysScroll(page);
        await shoot(page, "filtered", viewport.width, theme);
      });

      test("keyboard focus shows a ring", async ({ page }) => {
        await open(page, theme);
        const button = await tabToFirstButton(page);
        const ring = await button.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            matches: el.matches(":focus-visible"),
            outline: style.outlineStyle,
            shadow: style.boxShadow,
          };
        });
        expect(ring.matches).toBe(true);
        expect(ring.outline !== "none" || ring.shadow !== "none").toBe(true);
      });

      if (viewport.width === PHONE_WIDTH) {
        test("touch targets are at least 44x44", async ({ page }) => {
          await open(page, theme);
          expect(await smallTargets(page, MIN_TARGET)).toEqual([]);
        });
      }
    });
  }
}
