// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

vi.mock("framer-motion", () => ({
  motion: { div: (props: any) => React.createElement("div", props) },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? React.createElement("div", { "data-testid": "lightbox" }, children) : null,
  DialogContent: ({ children }: any) => React.createElement("div", null, children),
}))

vi.mock("next/image", () => ({
  default: (props: any) => React.createElement("img", { ...props, fill: undefined }),
}))

describe("ImageGallery", () => {
  it("renders with images", async () => {
    const { ImageGallery } = await import("@/components/ImageGallery")
    render(React.createElement(ImageGallery, {
      images: ["/img1.jpg", "/img2.jpg"],
      title: "Test Vehicle",
    }))
    expect(screen.getByText("1 / 2")).toBeDefined()
  })

  it("shows placeholder when no images", async () => {
    const { ImageGallery } = await import("@/components/ImageGallery")
    render(React.createElement(ImageGallery, { images: [], title: "No Photos" }))
    expect(screen.getByText("1 / 1")).toBeDefined()
  })

  it("navigates to next image on arrow click", async () => {
    const { ImageGallery } = await import("@/components/ImageGallery")
    render(React.createElement(ImageGallery, {
      images: ["/img1.jpg", "/img2.jpg"],
      title: "Nav Test",
    }))
    const nextBtn = screen.getByTitle("Open Fullscreen").parentElement!.querySelectorAll("button")[2]
    fireEvent.click(nextBtn)
    expect(screen.getByText("2 / 2")).toBeDefined()
  })
})
