//add page cursor
function cursor() {
  const cursor = document.createElement("div");
  cursor.id = "pageCursor";
  cursor.classList.add("pageCursor");

  const amount = 20,
    width = 26,
    idleTimeout = 150;
  const sineDots = Math.floor(amount * 0.3);
  let lastFrame = 0,
    mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    dots = [],
    timeoutID,
    idle = false;

  class HoverButton {
    constructor(element) {
      this.hovered = false;
      this.animatingHover = false;
      this.forceOut = false;
      this.timing = 0.65;
      this.el = element;
      this.el.addEventListener("mouseenter", this.onMouseEnter);
      this.el.addEventListener("mouseleave", this.onMouseLeave);
    }

    onMouseEnter = () => {
      this.hoverInAnim();
    };

    hoverInAnim = () => {
      if (!this.hovered) {
        this.hovered = true;
        this.animatingHover = true;
        this.forceOut = false;
        cursor.classList.add("hover");
        this.el.classList.add("hover");
        gsap.fromTo(
          cursor,
          this.timing,
          {
            opacity: 1,
            // mixBlendMode: "difference"
          },
          {
            opacity: 1,
            // mixBlendMode: "normal",
            ease: Power3.easeOut,
            onComplete: () => {
              this.animatingHover = false;
              if (this.forceOut) {
                this.foceOut = false;
                this.hoverOutAnim();
              }
            },
          }
        );
      }
    };

    onMouseLeave = () => {
      if (!this.animatingHover) {
        this.hoverOutAnim();
      } else {
        this.forceOut = true;
      }
    };

    hoverOutAnim = () => {
      cursor.classList.remove("hover");
      this.el.classList.remove("hover");
      this.hovered = false;
      gsap.to(cursor, this.timing, {
        opacity: 1,
        // mixBlendMode: "difference",
        ease: Power3.easeOut,
        onComplete: () => {},
      });
    };
  }
  class Dot {
    constructor(index = 0) {
      this.index = index;
      this.anglespeed = 0.05;
      this.x = 0;
      this.y = 0;
      this.scale = 1 - 0.05 * index;
      this.range = width / 2 - (width / 2) * this.scale + 2;
      this.limit = width * 0.75 * this.scale;
      this.element = document.createElement("span");
      gsap.set(this.element, { scale: this.scale });
      cursor.appendChild(this.element);
    }

    lock() {
      this.lockX = this.x;
      this.lockY = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }

    draw(delta) {
      if (!idle || this.index <= sineDots) {
        gsap.set(this.element, { x: this.x, y: this.y });
      } else {
        this.angleX += this.anglespeed;
        this.angleY += this.anglespeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        gsap.set(this.element, { x: this.x, y: this.y });
      }
    }
  }

  function cursorInit() {
    //append svg for gooey effect
    cursor.innerHTML +=
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="0" width="0" style="display:none;"><defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg>';

    document.body.appendChild(cursor);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    document.querySelectorAll("a").forEach((ee) => {
      new HoverButton(ee);
    });
    document.querySelectorAll("button").forEach((ee) => {
      new HoverButton(ee);
    });

    buildDots();
    render();

    if (window.innerWidth > 992) {
      document.getElementById("pageCursor").classList.remove("hide");
    } else {
      document.getElementById("pageCursor").classList.add("hide");
    }
  }

  function startIdleTimer() {
    timeoutID = setTimeout(goInactive, idleTimeout);
    idle = false;
  }

  function resetIdleTimer() {
    clearTimeout(timeoutID);
    startIdleTimer();
  }

  function goInactive() {
    idle = true;
    for (let dot of dots) {
      dot.lock();
    }
  }

  function buildDots() {
    for (let i = 0; i < amount; i++) {
      let dot = new Dot(i);
      dots.push(dot);
    }
  }

  const onMouseMove = (event) => {
    mousePosition.x = event.clientX - width / 2;
    mousePosition.y = event.clientY - width / 2;
    resetIdleTimer();
  };

  const onTouchMove = () => {
    mousePosition.x = event.touches[0].clientX - width / 2;
    mousePosition.y = event.touches[0].clientY - width / 2;
    resetIdleTimer();
  };

  const render = (timestamp) => {
    const delta = timestamp - lastFrame;
    positionCursor(delta);
    lastFrame = timestamp;
    requestAnimationFrame(render);
  };

  const positionCursor = (delta) => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    dots.forEach((dot, index, dots) => {
      let nextDot = dots[index + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw(delta);
      if (!idle || index <= sineDots) {
        const dx = (nextDot.x - dot.x) * 0.35;
        const dy = (nextDot.y - dot.y) * 0.35;
        x += dx;
        y += dy;
      }
    });
  };

  cursorInit();
}
window.addEventListener("DOMContentLoaded", cursor);
