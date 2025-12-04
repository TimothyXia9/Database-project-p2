import { useSelector } from "react-redux";

/**
 * Custom hook to check user permissions based on role
 * Roles: Customer, Employee, Admin
 */
const usePermissions = () => {
	const { isAuthenticated, user } = useSelector((state) => state.auth);

	const role = user?.account_type || null;

	// Check if user is authenticated
	const isLoggedIn = isAuthenticated;

	// Check specific roles
	const isCustomer = role === "Customer";
	const isEmployee = role === "Employee";
	const isAdmin = role === "Admin";

	// Check combined roles
	const isEmployeeOrAdmin = isEmployee || isAdmin;
	const isAdminOnly = isAdmin;

	// Permission checks based on USER_PERMISSIONS.md
	const permissions = {
		// Account Management
		canViewProfile: isLoggedIn,
		canEditProfile: isLoggedIn,

		// Series Browsing (all users including public)
		canViewSeries: true,
		canSearchSeries: true,

		// Feedback permissions
		canSubmitFeedback: isLoggedIn, // Customer, Employee, Admin
		canEditOwnFeedback: isLoggedIn, // Can edit their own feedback
		canDeleteFeedback: isAdmin, // Only Admin can delete feedback

		// Series Management
		canCreateSeries: isEmployeeOrAdmin,
		canEditSeries: isEmployeeOrAdmin,
		canDeleteSeries: isAdmin,

		// Episode Management
		canCreateEpisode: isEmployeeOrAdmin,
		canEditEpisode: isEmployeeOrAdmin,
		canDeleteEpisode: isAdmin,

		// Production House Management
		canCreateProductionHouse: isEmployeeOrAdmin,
		canEditProductionHouse: isEmployeeOrAdmin,
		canDeleteProductionHouse: isAdmin,

		// Producer Management
		canCreateProducer: isEmployeeOrAdmin,
		canEditProducer: isEmployeeOrAdmin,
		canDeleteProducer: isAdmin,

		// Contract Management
		canViewContracts: isLoggedIn, // All logged in users can view
		canCreateContract: isEmployeeOrAdmin,
		canEditContract: isEmployeeOrAdmin,
		canDeleteContract: isAdmin,

		// User Management (Admin only)
		canManageUsers: isAdmin,
		canChangeUserRoles: isAdmin,
		canDeleteUsers: isAdmin,

		// System Management
		canAccessAdmin: isEmployeeOrAdmin,
		canViewSystemStats: isAdmin,
	};

	return {
		user,
		role,
		isLoggedIn,
		isCustomer,
		isEmployee,
		isAdmin,
		isEmployeeOrAdmin,
		isAdminOnly,
		permissions,
	};
};

export default usePermissions;
