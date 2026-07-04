import { Ic } from '../../components/icons';

export default function StatCard({icon,label,value,change,changeDir,color,delay=0}){
  const isUp=changeDir==='up';
  return(
    <div className="dm-card rounded-xl border dm-border p-5 hover:shadow-lg transition-shadow anim-fadeInUp" style={{animationDelay:`${delay}s`,opacity:0,animationFillMode:'forwards'}}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${isUp?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
          {isUp?<Ic.TrendUp s={12}/>:<Ic.TrendDown s={12}/>}{change}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold dm-text">{value}</p>
      <p className="text-sm dm-text-muted mt-0.5">{label}</p>
    </div>
  );
}
