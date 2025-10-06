import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const activeNavigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Air Quality', href: '/air-quality' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'FAQ', href: '/faq' },
  { name: '🎮 Game', href: '/air-quality-game' },
];

const premiumFeatures = [
  { name: 'Predictions', href: '/predictions', icon: '🔮' },
  { name: 'Coaching', href: '/coaching', icon: '💪' },
  { name: 'Health Tracking', href: '/health-tracking', icon: '❤️' },
  { name: 'Journey', href: '/gamification', icon: '🎮' },
  { name: 'Smart Home', href: '/smart-home', icon: '🏠' },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/dashboard" className="text-xl font-bold text-gradient">
                    Authenticai
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
                  {activeNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                        location.pathname === item.href
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Premium Features Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-not-allowed">
                      Premium Features
                      <LockClosedIcon className="ml-1 h-4 w-4" />
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wide border-b">
                            Coming Soon - Premium Only
                          </div>
                          {premiumFeatures.map((feature) => (
                            <Menu.Item key={feature.name} disabled>
                              {({ active }) => (
                                <div
                                  className={clsx(
                                    'px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center',
                                    active && 'bg-gray-50'
                                  )}
                                >
                                  <span className="mr-2">{feature.icon}</span>
                                  {feature.name}
                                  <LockClosedIcon className="ml-auto h-4 w-4" />
                                </div>
                              )}
                            </Menu.Item>
                          ))}
                          <div className="border-t mt-1 pt-1">
                            <div className="block px-4 py-2 text-sm text-gray-400 font-medium cursor-not-allowed">
                              ✨ Upgrade to Premium (Coming Soon)
                            </div>
                          </div>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {user?.subscription_tier === 'free' && (
                  <button
                    disabled
                    className="mr-4 text-xs px-3 py-1 bg-gray-100 text-gray-400 rounded cursor-not-allowed"
                    title="Coming Soon"
                  >
                    Upgrade (Coming Soon)
                  </button>
                )}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/manage-donation"
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Donations
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <span
                            className={clsx(
                              'block px-4 py-2 text-sm text-gray-400 cursor-not-allowed'
                            )}
                            title="Coming soon"
                          >
                            Subscription
                          </span>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/privacy"
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Privacy & Data
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {activeNavigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={clsx(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200',
                    location.pathname === item.href
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="pl-3 pr-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  Premium Features (Coming Soon)
                </div>
                {premiumFeatures.map((feature) => (
                  <div
                    key={feature.name}
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 cursor-not-allowed flex items-center"
                  >
                    <span className="mr-2">{feature.icon}</span>
                    {feature.name}
                    <LockClosedIcon className="ml-auto h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as={Link}
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Profile
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  to="/manage-donation"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Donations
                </Disclosure.Button>
                <span
                  className="block px-4 py-2 text-base font-medium text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                >
                  Subscription
                </span>
                <Disclosure.Button
                  as="button"
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
