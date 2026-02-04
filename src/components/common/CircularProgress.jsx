const CircularProgress = ({ percentage = 50 }) => {
  const radius = 45;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - percentage) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[32px] h-[32px]">
      <svg
        className="absolute w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Define Gradients */}
        <defs>
          <linearGradient
            id="brand-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="12.88%" stopColor="#3EDD59" />
            <stop offset="87.12%" stopColor="#CCF566" />
          </linearGradient>
          <linearGradient
            id="light-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="12.88%" stopColor="rgba(62, 221, 89, 0.28)" />
            <stop offset="87.12%" stopColor="rgba(204, 245, 102, 0.28)" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="url(#light-gradient)" // Reference the gradient by ID
        />

        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          stroke="url(#brand-gradient)" // Reference the gradient by ID
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="text-[10px] font-medium text-baseWhiteDark dark:text-baseWhite">
        {Number(percentage?.toFixed(1))}%
      </span>
    </div>
  );
};

export default CircularProgress;
