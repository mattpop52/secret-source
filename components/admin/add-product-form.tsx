"use client";

import { type FormEvent, useId, useState } from "react";
import { toast } from "sonner";

export type SimpleOption = { slug: string; name: string };

const INPUT_CLASS =
  "w-full border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2 text-[0.75rem] text-[var(--ss-bone)] transition-colors placeholder:text-[var(--ss-smoke)] hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]";
const LABEL_CLASS =
  "ss-stencil mb-1.5 block text-[0.6rem] text-[var(--ss-smoke)]";

// Categories with no size run of their own — the size the tag actually
// reads is a single free-text field instead of an automatic run.
const ONE_UNIT_CATEGORIES = new Set(["bags", "hats"]);

export function AddProductForm({
  categories,
  brands,
}: {
  categories: SimpleOption[];
  brands: SimpleOption[];
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const formId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Could not add that item.");
        return;
      }

      toast.success(
        "Added — appears here and on the site in a minute or two once it redeploys.",
      );
      event.currentTarget.reset();
      setCategory(categories[0]?.slug ?? "");
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-8 border border-[var(--ss-hairline)]">
      <button
        aria-expanded={open}
        className="ss-stencil flex w-full items-center justify-between px-4 py-3.5 text-[0.7rem] transition-colors hover:text-[var(--ss-orange)]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        + Add new item
        <span className={`transition-transform ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>

      {open && (
        <form
          className="grid gap-4 border-[var(--ss-hairline)] border-t p-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-category`}>
              Category
            </label>
            <select
              className={INPUT_CLASS}
              id={`${formId}-category`}
              name="category"
              onChange={(event) => setCategory(event.target.value)}
              required
              value={category}
            >
              {categories.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-brand`}>
              Brand
            </label>
            <select
              className={INPUT_CLASS}
              id={`${formId}-brand`}
              name="brand"
              required
            >
              {brands.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-name`}>
              Name
            </label>
            <input
              className={INPUT_CLASS}
              id={`${formId}-name`}
              name="name"
              placeholder="Drew Peak Tracksuit"
              required
              type="text"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-colourway`}>
              Colourway
            </label>
            <input
              className={INPUT_CLASS}
              id={`${formId}-colourway`}
              name="colourwayName"
              placeholder="Heather Grey"
              required
              type="text"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-price`}>
              Price (£)
            </label>
            <input
              className={INPUT_CLASS}
              id={`${formId}-price`}
              inputMode="decimal"
              name="price"
              placeholder="100.00"
              required
              type="text"
            />
          </div>

          {ONE_UNIT_CATEGORIES.has(category) && (
            <div>
              <label className={LABEL_CLASS} htmlFor={`${formId}-size`}>
                Size on the tag
              </label>
              <input
                className={INPUT_CLASS}
                defaultValue="One size"
                id={`${formId}-size`}
                name="sizeLabel"
                type="text"
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-fill`}>
              Swatch colour
            </label>
            <input
              className="h-[38px] w-full border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)]"
              defaultValue="#B7B7B4"
              id={`${formId}-fill`}
              name="fill"
              type="color"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-accent`}>
              Swatch accent
            </label>
            <input
              className="h-[38px] w-full border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)]"
              defaultValue="#141414"
              id={`${formId}-accent`}
              name="accent"
              type="color"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-front`}>
              Front photo
            </label>
            <input
              accept="image/*"
              className={INPUT_CLASS}
              id={`${formId}-front`}
              name="frontImage"
              required
              type="file"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${formId}-back`}>
              Back photo (optional)
            </label>
            <input
              accept="image/*"
              className={INPUT_CLASS}
              id={`${formId}-back`}
              name="backImage"
              type="file"
            />
          </div>

          <p className="text-[var(--ss-smoke)] text-xs sm:col-span-2">
            Sizes, the docket number, and the description are filled in
            automatically from the category and brand — edit the description
            afterwards from the stock list below once it's live, if needed.
          </p>

          <button
            className="ss-stencil bg-[var(--ss-orange)] py-3 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60 sm:col-span-2"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Adding…" : "Add item"}
          </button>
        </form>
      )}
    </div>
  );
}
