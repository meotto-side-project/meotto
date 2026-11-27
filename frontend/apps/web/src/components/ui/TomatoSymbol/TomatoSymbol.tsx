import { type ComponentProps } from "react";

interface TomatoSymbolProps extends Omit<ComponentProps<"svg">, "children"> {
  title?: string;
}

const TomatoSymbol = ({ title = "멋토", ...props }: TomatoSymbolProps) => {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 95.6325 79.3236"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M27.7059 0L4.66478 19.1175L0 39.5191L4.94749 59.2073L26.9992 78.6102L55.1292 79.3236L66.5791 67.3394L80.8561 60.9194L85.2382 39.5191L80.8561 19.6882L61.3489 0H27.7059Z"
        className="fill-logo-red"
      />
      <path
        transform="translate(25.12 1.61)"
        d="M10.2669 15.9744L18.3351 23.1957L8.70334 35.8302L6.09668 47.3756L18.9796 40.3505L30.6438 35.3266L39.7122 43.4672L47.9957 54.7296L48.5033 38.4864L47.1245 29.7597L61.2262 27.5317L70.5115 22.438L47.1083 17.2654L50.8057 7.59263L49.6061 0L32.5775 13.4658L12.821 8.93611L0 14.0192L10.2669 15.9744Z"
        className="fill-green mix-blend-multiply"
      />
    </svg>
  );
};

export default TomatoSymbol;
