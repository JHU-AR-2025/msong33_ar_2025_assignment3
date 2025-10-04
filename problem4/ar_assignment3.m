syms fx fy ox oy W H n f
M_proj = [ 2*fx./W   0       (W-(2*ox))./W       0
           0        2*fy./H  (-H+(2*oy))./H      0
           0        0       -(f+n)./(f-n)    -2*f*n./(f-n)
           0        0       -1                0];

%% MODIFY PARAMETERS AND VERTEX HERE 
% Given camera parameters
fx_val = 650;
fy_val = 650;
ox_val = fx_val./2;
oy_val = fx_val./2;
W_val = 640;
H_val = 480;
n_val = 0.1;
f_val = 10;

% Given Pc vertex
Pc = [0.2; -0.2; -9.0; 1];


%% Calculations for (u,v)
% Calculate the projection matrix for the given parameters
M_proj_val = subs(M_proj, ...
   [fx fy ox oy W H n f], ...
   [fx_val fy_val ox_val oy_val W_val H_val n_val f_val]);

% Apply the projection matrix to the point coordinates
P_proj = M_proj_val * Pc;

NDC = [P_proj(1)/P_proj(4); P_proj(2)/P_proj(4); P_proj(3)/P_proj(4)];

u = double(0.5*(NDC(1)+1)*W_val)
v = double(0.5*(NDC(2)+1)*H_val)