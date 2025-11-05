import Select from "react-select";
import { useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

const SelectInput = ({
  label,
  error,
  icon,
  options,
  isMulti = false,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const showFloating =
    isFocused ||
    (isMulti ? value?.length > 0 : value !== null && value !== undefined);

  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <div className="text-sm font-medium text-gray-900">
          {data.label}{" "}
          {data?.department && (
            <span className="text-gray-400 text-[10px]">
              (Dept: {data?.department})
            </span>
          )}
        </div>
        {data.email && (
          <div className="text-xs text-gray-500">
            {data.email}{" "}
            {data?.role && (
              <span className="text-gray-400 text-[10px]">({data?.role})</span>
            )}
          </div>
        )}
        {data.trackingMode && (
          <span className="text-gray-500 text-xs">
            (Tracking Mode: {data.trackingMode})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative border-b-2 border-gray-300 group focus-within:border-primary transition-all duration-200",
          error && "border-red-500",
          className
        )}
      >
        {/* Animation Border */}
        <div className="absolute bottom-[-2px] left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>

        {icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 z-10">
            {icon}
          </div>
        )}

        <Select
          options={options}
          isMulti={isMulti}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          classNamePrefix="custom-select"
          className="z-10"
          isDisabled={disabled}
          components={{ Option: CustomOption }}
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
          menuPlacement={props.menuPlacement || "auto"}
          menuPosition={props.menuPosition || "absolute"}
          filterOption={(option, inputValue) => {
            const name = option.label.toLowerCase();
            const email = (option.data.email || "").toLowerCase();
            const input = inputValue.toLowerCase();
            return name.includes(input) || email.includes(input);
          }}
          styles={{
            control: (base, state) => ({
              ...base,
              background: "transparent",
              border: "none", // Tailwind gray-300
              boxShadow: "none",
              paddingTop: "1.4rem",
              paddingBottom: "0rem",
              paddingLeft: icon ? "2rem" : "0rem",
              cursor: "pointer",
            }),
            placeholder: (base) => ({
              ...base,
              color: "transparent",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#111827",
            }),
            multiValue: (base, state) => {
              if (props.id === "hidden-select") {
                return {
                  ...base,
                  display: "none",
                };
              }
              return base;
            },
            valueContainer: (base) => ({
              ...base,
              flexWrap: "nowrap",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? "#f3f4f6" // Tailwind gray-100 on hover
                : "white",
              color: "#111827", // Tailwind gray-900
              cursor: "pointer",
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          {...props}
        />

        <label
          className={cn(
            "absolute top-4 left-0 text-gray-500 duration-300 origin-0 pointer-events-none z-20",
            icon && "left-7",
            showFloating && "transform -translate-y-4 scale-75 text-primary",
            error && "text-red-500"
          )}
        >
          {required && (
            <span className="font-bold text-red-500 mr-0.5 text-lg">*</span>
          )}{" "}
          {label}
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

SelectInput.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  icon: PropTypes.node,
  options: PropTypes.array.isRequired,
  isMulti: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
  className: PropTypes.string,
  menuPlacement: PropTypes.oneOf(["auto", "bottom", "top"]),
  menuPosition: PropTypes.oneOf(["absolute", "fixed"]),
};

export default SelectInput;
