type SocialLogin = {
  name: string;
  icon: string;
  className: string;
};

const socialButtonStyles: Record<string, string> = {
  Google: "bg-white border border-black hover:bg-slate-50 shadow-sm",
  Kakao: "bg-[#FEE500] hover:brightness-[0.97]",
};

export const SOCIAL_LOGIN: SocialLogin[] = [
  {
    name: "Google",
    icon: "/google.svg",
    className: socialButtonStyles.Google,
  },
  {
    name: "Kakao",
    icon: "/kakao.svg",
    className: socialButtonStyles.Kakao,
  },
];
