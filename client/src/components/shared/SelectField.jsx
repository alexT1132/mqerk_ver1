import { TextField, MenuItem } from "@mui/material";


export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  error = false,
  helperText = "",
  fullWidth = true,
  size = "small",
  className = "",
  sx,
}) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      size={size}
      error={error}
      helperText={helperText}
  InputLabelProps={{ shrink: true }}
      SelectProps={{ displayEmpty: true }}
      className={className}
      sx={sx}
    >
      <MenuItem value="">
        <em>{placeholder}</em>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
