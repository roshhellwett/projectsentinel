"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Post } from "@/types";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerContent } from "./DrawerContent";
import { DrawerFooter } from "./DrawerFooter";
import {
  lockBodyScroll,
  unlockBodyScroll,
  forceUnlockBodyScroll,
} from "@/lib/utils/bodyScrollLock";
import { Z_INDEX } from "@/lib/theme/zIndex";

interface NewsDrawerProps {
  post: Post | null;
  onClose: () => void;
  onSelectRelated?: (post: Post) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export function NewsDrawer({
  post,
  onClose,
  onSelectRelated,
  onNext,
  onPrev,
}: NewsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const postRef = useRef(post);
  const yOffsetRef = useRef(0);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMoveYRef = useRef(0);
  const velocityRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const [canDrag, setCanDrag] = useState(false);
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);
  const [mounted, setMounted] = useState(false);

  if (post) postRef.current = post;
  const displayPost = post || postRef.current;

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCanDrag(query.matches);
    sync();
    if (query.addEventListener) {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }
    if (query.addListener) query.addListener(sync);
    return () => {
      if (query.removeListener) query.removeListener(sync);
    };
  }, []);

  useEffect(() => {
    if (post) {
      setRender(true);
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShow(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setShow(false);
    const t = setTimeout(() => setRender(false), 300);
    return () => clearTimeout(t);
  }, [post]);

  useEffect(() => {
    if (!render) {
      forceUnlockBodyScroll();
      document.body.classList.remove("article-overlay-open");
      return;
    }
    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    lockBodyScroll();
    document.body.classList.add("article-overlay-open");
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.clearTimeout(focusTimer);
      document.body.classList.remove("article-overlay-open");
      unlockBodyScroll();
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [render]);

  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const focusableElements = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) =>
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        window.getComputedStyle(el).visibility !== "hidden",
    );

    if (focusableElements.length === 0) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCloseRef.current();
      return;
    }
    handleTabKey(e);
  }, [handleTabKey]);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canDrag) return;
      draggingRef.current = true;
      startYRef.current = e.clientY;
      yOffsetRef.current = 0;
      startTimeRef.current = Date.now();
      lastMoveTimeRef.current = Date.now();
      lastMoveYRef.current = e.clientY;
      velocityRef.current = 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (panelRef.current) panelRef.current.style.transition = "none";
    },
    [canDrag],
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !panelRef.current) return;
    const now = Date.now();
    const dt = now - lastMoveTimeRef.current;
    const dy = e.clientY - lastMoveYRef.current;
    if (dt > 0) velocityRef.current = dy / (dt / 1000);
    lastMoveTimeRef.current = now;
    lastMoveYRef.current = e.clientY;
    yOffsetRef.current = Math.max(0, e.clientY - startYRef.current);
    panelRef.current.style.transform = `translateY(${yOffsetRef.current}px)`;
  }, []);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !panelRef.current) return;
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (yOffsetRef.current > 100 || velocityRef.current > 600) {
      onCloseRef.current();
    } else {
      panelRef.current.style.transition = "transform 0.3s var(--ease-apple)";
      panelRef.current.style.transform = "translateY(0)";
    }
    yOffsetRef.current = 0;
    velocityRef.current = 0;
  }, []);

  if (!mounted || !render) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity duration-300 transform-gpu ${Z_INDEX.modalBackdrop} ${show ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {displayPost && (
        <div
          ref={(el) => {
            drawerRef.current = el;
            panelRef.current = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Article: ${displayPost.headline}`}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`pointer-events-none fixed ${Z_INDEX.drawerPanel} bg-paper-2/95 glass border-l-2 border-ink/30 shadow-2xl lg:left-auto lg:right-0 lg:top-0 lg:h-dynamic lg:w-[min(520px,44vw)] 2xl:w-[min(580px,34vw)] top-0 bottom-0 left-0 right-0 h-dynamic overflow-hidden flex flex-col transform-gpu will-change-transform transition-all duration-300 ease-out ${show ? "opacity-100 translate-y-0 lg:translate-x-0" : "opacity-0 translate-y-full lg:translate-y-0 lg:translate-x-full"}`}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div
            className="pointer-events-auto lg:hidden flex-shrink-0 flex flex-col items-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <div className="w-12 h-1.5 rounded-full bg-rule-strong shadow-inner transition-transform active:scale-95" />
          </div>

          <DrawerHeader
            category={displayPost.category}
            publishedAt={displayPost.published_at}
            onClose={onClose}
            onNext={onNext}
            onPrev={onPrev}
          />

          <div className="pointer-events-auto min-h-0 flex-1 flex flex-col">
            <DrawerContent
              post={displayPost}
              onSelectRelated={onSelectRelated}
            />
          </div>

          <div className="pointer-events-auto">
            <DrawerFooter post={displayPost} siteUrl={siteUrl} />
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
