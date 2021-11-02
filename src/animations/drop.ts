type TPoint = {x:number,y:number};

class Color
{
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number,g: number,b: number,a: number = 1)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    color(ratio: number = 1)
    {
        const {r,g,b,a} = this;
        return `rgba(${r},${g},${b},${a*ratio})`;
    }
}

export class Drop
{
    strokeStyle = new Color(70,109,174);
    init: TPoint;
    lineWidth: number;
    radius: number;
    width: number;
    height: number;
    burstProportion: number;
    burstRadius: number;
    burstParticleCount: number;
    angs: number[] = [];

    constructor(
        init: TPoint,
        lineWidth: number,
        radius: number,
        width: number,
        height: number,
        burstProportion: number,
        burstRadius: number,
        burstParticleCount: number
    )
    {
        this.init = {x:init.x,y:init.y};
        this.lineWidth = lineWidth;
        this.radius = radius;
        this.width = width;
        this.height = height;
        this.burstProportion = burstProportion;
        this.burstRadius = burstRadius;
        this.burstParticleCount = burstParticleCount;

        const circleAngle = Math.PI*2;
        const segAngle = circleAngle/burstParticleCount;
        for(let i=0;i<burstParticleCount;i++)
        {
            let ang = i*segAngle+(Math.random()*2-1)*(segAngle/3);
            if (ang<0) ang+= circleAngle;
            if (ang>circleAngle) ang-= circleAngle;
            this.angs.push(ang);
        }
    }

    draw(ctx: CanvasRenderingContext2D,_ratio: number)
    {
        const { 
            height,
            width,
            strokeStyle,
            lineWidth,
            radius,
            init:{x:ix,y:iy},
            burstProportion,            
            burstRadius,
            burstParticleCount,
            angs
        } = this;
        const floatProportion = 1-burstProportion;
        if (_ratio<=floatProportion)
        {
            const ratio = _ratio/floatProportion;
            ctx.strokeStyle = strokeStyle.color();
            ctx.lineWidth = lineWidth;
            ctx.beginPath();        
            const dx = Math.sin(((ratio*2)%1)*Math.PI*2)*width/2;
            ctx.arc(ix+dx,iy-ratio*height,radius,0,Math.PI*2);
            ctx.closePath();
            ctx.stroke();
        }
        else
        {
            const ratio = (_ratio-floatProportion)/burstProportion;
            const radiusFrom = radius+lineWidth;
            const radiusTo = radiusFrom+burstRadius;            
            const radiusTotalLength = radiusTo-radiusFrom;
            const particleLength = lineWidth*1.1;
            const particleWidth = particleLength*0.67;
            const centerPoint = {x:ix,y:iy-height};
            for(let i=0;i<burstParticleCount;i++)
            {
                let ang = angs[i];
                const radiusToPoint = (r: number) => ({x:centerPoint.x+Math.cos(ang)*r,y:centerPoint.y+Math.sin(ang)*r});
                const from = radiusFrom+radiusTotalLength*ratio; 
                const to = from+particleLength; 
                const {x:fx,y:fy} = radiusToPoint(from);
                const {x:tx,y:ty} = radiusToPoint(to);                
                const {x:mx,y:my} = radiusToPoint((from+to)/2);
                // ctx.strokeStyle = strokeStyle.color(1-ratio);
                ctx.fillStyle = strokeStyle.color(1-ratio);
                // ctx.lineWidth = particleWidth;
                ctx.beginPath();                
                // ctx.moveTo(fx,fy);
                // ctx.lineTo(tx,ty);
                
                ctx.ellipse(mx,my,particleLength/2,particleWidth/2,ang,0,Math.PI*2);
                ctx.closePath();
                // ctx.stroke();    
                ctx.fill();    
            }
        }
    }
}