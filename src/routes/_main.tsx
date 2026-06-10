import { Avatar, AvatarFallback } from '#/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '#/components/ui/dropdown-menu';
import { api } from '#/lib/axios';
import { getInitials } from '#/lib/get-initials';
import { useLogoutMutation } from '#/services/auth/authMutations';
import { useAuthStore } from '#/store/authStore';
import { isTokenExpired } from '#/utils/jwt';
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { Calendar, LogOutIcon, User } from 'lucide-react';

export const Route = createFileRoute('/_main')({
    ssr: false,
    beforeLoad: async ({ context }) => {

        if (!context.auth?.accessToken) {
            throw redirect({ to: '/login', statusCode: 302 })
        }

        const { accessToken, setAuth, clearAuth } = useAuthStore.getState();

        if (accessToken && !isTokenExpired(accessToken)) {
            return;
        }

        try {
            const { data } = await api.post("/v1/auth/refresh");
            setAuth(data.data);
        } catch (e) {
            clearAuth();
            throw redirect({ to: "/login" });
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = useAuthStore();
    const logout = useLogoutMutation();
    const initials = getInitials(`${user?.firstName} ${user?.lastName}`)

    return (
        <div className="flex flex-col min-h-screen bg-[#FBF9F6]">

            <header className="border-b border-neutral-200 bg-[#FBF9F6] sticky top-0 z-50">
                <div className="w-full max-w-5xl mx-auto flex h-14 items-center px-4">

                    <Link to="/events" className="flex items-center gap-2 font-semibold text-sm text-neutral-900">
                        <Calendar className="h-4 w-4 text-[#E05C33]" />
                        <span>EMS</span>
                    </Link>


                    <div className="ml-auto flex items-center gap-6">
                        <Link
                            to="/events"
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                            activeOptions={{ exact: true }}
                            activeProps={{ className: "text-sm text-[#E05C33] font-medium border-b-2 border-[#E05C33] pb-0.5" }}
                        >
                            Events
                        </Link>
                        <Link
                            to="/events/tickets"
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                            activeOptions={{ exact: true }}
                            activeProps={{ className: "text-sm text-[#E05C33] font-medium border-b-2 border-[#E05C33] pb-0.5" }}
                        >
                            My tickets
                        </Link>


                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E05C33] focus-visible:ring-offset-2">
                                    <AvatarFallback className="bg-[#E05C33] text-white text-xs font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-neutral-900">John Doe</span>
                                        <span className="text-xs text-neutral-500">john@example.com</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/" className="flex items-center gap-2 cursor-pointer">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={() => {
                                        logout.mutate();
                                    }}
                                >
                                    <LogOutIcon className="h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    )
}