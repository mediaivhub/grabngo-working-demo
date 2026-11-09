/** Big title card, a thin grey gap, then the top of the white list sheet with the result count. */
export function ListHero({ title, body, count }: { title: string; body: string; count: number }) {
  return (
    <div className="bg-surface">
      <div className="rounded-b-[28px] bg-white px-5 pb-7 pt-5">
        <h1 className="whitespace-pre-line text-[34px] font-bold leading-[38px] tracking-[-0.8px]">{title}</h1>
        <p className="mt-3 max-w-[300px] text-[16px] leading-[23px] text-gray">{body}</p>
      </div>
      <div className="mt-1.5 rounded-t-[28px] bg-white px-5 pb-3 pt-[22px]">
        <p className="text-[16px] text-gray">{String(count).padStart(2, '0')} Results found</p>
      </div>
    </div>
  );
}
