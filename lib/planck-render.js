class CanvasRenderer {
    constructor(t, e, s = {}) {
        const r = {
            scale: 16,
            lineWidth: 1 / 16,
            strokeStyle: {
                dynamic: "black",
                static: "black",
                kinematic: "black"
            }
        };
        this.options = Object.assign(r, s), s.lineWidth || (this.options.lineWidth = 1 / this.options.scale), this.world = t, this.ctx = e, this.canvas = e.canvas, this.draw = null, this.clear = ((t, e) => {
            e.clearRect(0, 0, t.width, t.height)
        })
    }
    renderWorld() {
        const {
            ctx: t,
            canvas: e,
            options: s
        } = this;
        this.clear(e, t), "function" == typeof this.draw && this.draw(t);
        for (let e = this.world.getBodyList(); e; e = e.getNext())
            for (let r = e.getFixtureList(); r; r = r.getNext()) {
                if (e.render && e.render.hidden) continue;
                e.render && e.render.stroke ? t.strokeStyle = e.render.stroke : e.isDynamic() ? t.strokeStyle = s.strokeStyle.dynamic : e.isKinematic() ? t.strokeStyle = s.strokeStyle.kinematic : e.isStatic() && (t.strokeStyle = s.strokeStyle.static);
                const n = r.getType(),
                    i = r.getShape();
                t.save(), t.scale(this.options.scale, this.options.scale), t.lineWidth = s.lineWidth, "circle" === n && this.drawCircle(e, i), "edge" === n && this.drawEdge(e, i), "polygon" === n && this.drawPolygon(e, i), "chain" === n && this.drawPolygon(e, i), t.restore()
            }
        for (let e = this.world.getJointList(); e; e = e.getNext()) t.save(), t.scale(this.options.scale, this.options.scale), this.drawJoint(e), t.restore()
    }
    drawCircle(t, e) {
        const s = this.ctx,
            r = this.options.lineWidth,
            n = e.m_radius,
            i = t.getPosition(),
            o = t.getAngle(),
            a = 2 * n + 2 * r;
        if (s.translate(i.x + r, i.y + r), s.rotate(o), t.render && t.render.custom) {
            const e = {
                x: -n - 2 * r,
                y: -n - 2 * r
            };
            if (!0 !== t.render.custom(s, e, a + r)) return
        }
        s.beginPath(), s.arc(0, 0, n, 0, 2 * Math.PI), s.stroke(), s.restore()
    }
    drawEdge(t, e) {
        const s = this.ctx,
            r = e.m_vertex1,
            n = e.m_vertex2;
        s.beginPath(), s.moveTo(r.x, r.y), s.lineTo(n.x, n.y), s.lineCap = "round", s.stroke()
    }
    drawPolygon(t, e) {
        const s = this.ctx,
            r = this.options.lineWidth,
            n = e.m_vertices;
        if (!n.length) return;
        let i = 1 / 0,
            o = 1 / 0,
            a = -1 / 0,
            c = -1 / 0;
        for (const t of n) i = Math.min(i, t.x), a = Math.max(a, t.x), o = Math.min(o, t.y), c = Math.max(c, t.y);
        const h = a - i,
            l = c - o,
            d = t.getPosition(),
            u = t.getAngle();
        if (s.translate(d.x + 2 * r, d.y + 2 * r), s.rotate(u), t.render && t.render.custom) {
            const e = {
                    width: h + r,
                    height: l + r
                },
                n = {
                    x: i - r,
                    y: o - r
                };
            if (!0 !== t.render.custom(s, n, e)) return
        }
        s.beginPath();
        for (let t = 0; t < n.length; ++t) {
            const e = n[t],
                i = e.x - r,
                o = e.y - r;
            0 === t ? s.moveTo(i, o) : s.lineTo(i, o)
        }
        n.length > 2 && s.closePath(), s.stroke()
    }
    drawJoint(t) {
        const e = this.ctx,
            s = t.getAnchorA(),
            r = t.getAnchorB();
        e.beginPath(), e.moveTo(s.x, s.y), e.lineTo(r.x, r.y), e.stroke()
    }
}

class Runner {
    constructor(t, e = {}) {
        this.options = Object.assign({
            fps: 60,
            speed: 1
        }, e), this.world = t, this.fps = 0, this.runId = null, this.render = null, this.update = null
    }
    start(t = !1, e = !1) {
        if (this.runId) return;
        t && (this.render = t), e && (this.update = t);
        const s = 1 / this.options.fps,
            r = 1 / this.options.speed * s;
        let n, i, o = performance.now(),
            a = 0;
        const c = () => {
            for (n = performance.now(), a += Math.min(1, (n - o) / 1e3); a > r;) this.world.step(s), "function" == typeof e && this.update(s), a -= r;
            i = (n - o) / 1e3, this.fps = 1 / i, o = n, this.render(), this.runId = requestAnimationFrame(c)
        };
        this.runId = requestAnimationFrame(c)
    }
    stop() {
        this.runId && (cancelAnimationFrame(this.runId), this.runId = null)
    }
}

class SVGRenderer {
    constructor() {
        throw new Error("Your browser does not support the canvas element")
    }
}

const canvas = () => !!document.createElement("canvas").getContext("2d"),
    Renderer = canvas() ? CanvasRenderer : SVGRenderer;